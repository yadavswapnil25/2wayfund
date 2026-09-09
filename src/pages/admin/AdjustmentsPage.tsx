import { useMemo, useState } from "react";
import { RefreshCw, Scale } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { ACCOUNT_OPENED_ISO } from "../../data/constants";
import { clockTime, isoToDisplay, stamp, today, todayIso, validateValueDate } from "../../lib/dates";
import { formatCode } from "../../lib/format";
import { generateRef } from "../../lib/refs";
import type { AdjustmentEntry, Message, Transaction } from "../../types/data";

type AdjType = AdjustmentEntry["type"];

const TYPE_LABEL: Record<AdjType, string> = { reversal: "Reversal", correction: "Correction", valuedate: "Value-date amendment" };

function adjTagVariant(status: AdjustmentEntry["status"]): string {
  if (status === "Posted") return "approved";
  if (status === "Rejected") return "rejected";
  return "review";
}

function sign(direction: "credit" | "debit"): string {
  return direction === "credit" ? "+" : "−";
}

export function AdjustmentsPage() {
  const { store, setStore, session } = useApp();

  const adjustable = useMemo(() => store.transactions.filter((t) => !t.reversed && t.ref), [store.transactions]);

  const [targetRef, setTargetRef] = useState("");
  const [type, setType] = useState<AdjType>("reversal");
  const [reason, setReason] = useState(store.adjustmentReasons[0] ?? "");
  const [valueDate, setValueDate] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [narrative, setNarrative] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const target = adjustable.find((t) => t.ref === targetRef) ?? null;

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function selectTarget(ref: string) {
    setTargetRef(ref);
    const t = store.transactions.find((x) => x.ref === ref);
    if (t) setValueDate(t.valueIso || todayIso());
  }

  function clearForm() {
    setTargetRef("");
    setType("reversal");
    setReason(store.adjustmentReasons[0] ?? "");
    setValueDate(todayIso());
    setAmount("");
    setNarrative("");
    setNote("");
    setErrors({});
  }

  function submit() {
    if (!target) {
      setErr("txn", "Select an entry to adjust.");
      return;
    }
    let ok = true;

    const vErr = validateValueDate(valueDate, ACCOUNT_OPENED_ISO);
    if (vErr) {
      setErr("value", vErr);
      ok = false;
    } else setErr("value", null);

    let parsedAmount = 0;
    if (type === "correction") {
      parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
      if (!isFinite(parsedAmount) || parsedAmount <= 0) {
        setErr("amount", "Enter the corrected amount.");
        ok = false;
      } else if (parsedAmount === target.amount) {
        setErr("amount", "The corrected amount matches the original — use a value-date amendment instead.");
        ok = false;
      } else setErr("amount", null);
    }

    if (note.trim().length < 15) {
      setErr("note", "Give a reason narrative of at least 15 characters — it is retained permanently.");
      ok = false;
    } else setErr("note", null);

    if (!ok) return;

    const entry: AdjustmentEntry = {
      ref: generateRef("2WF-ADJ-", 4400, store.adjustments.length),
      type,
      targetRef: target.ref,
      valueIso: valueDate,
      amount: parsedAmount,
      narrative: narrative.trim(),
      reason,
      note: note.trim(),
      status: "Pending authorisation",
      maker: session.display,
      raisedAt: stamp(),
      checker: null,
      decidedAt: null,
      bookedAt: null,
    };

    setStore((s) => ({ ...s, adjustments: [entry, ...s.adjustments] }));
    clearForm();
    setConfirmMsg(
      "The adjustment is pending and has not touched the ledger. A second officer must authorise it — sign in under the other staff role to complete the posting."
    );
  }

  function decide(a: AdjustmentEntry, approve: boolean) {
    setStore((s) => {
      const t = s.transactions.find((x) => x.ref === a.targetRef);

      if (!t || !approve) {
        return {
          ...s,
          adjustments: s.adjustments.map((x) =>
            x.ref === a.ref
              ? {
                  ...x,
                  status: "Rejected" as const,
                  checker: session.display,
                  decidedAt: stamp(),
                  note: !t ? x.note + " [original entry no longer present]" : x.note,
                }
              : x
          ),
        };
      }

      const balances = s.balances.map((b) => ({ ...b }));
      function applyEffect(currency: Transaction["currency"], amt: number, direction: "credit" | "debit") {
        const bal = balances.find((b) => b.currency === currency);
        if (bal) bal.amount += direction === "credit" ? amt : -amt;
      }

      let transactions = s.transactions;
      const bookedAt = stamp();

      if (a.type === "valuedate") {
        transactions = transactions.map((x) =>
          x.ref === a.targetRef
            ? { ...x, valueIso: a.valueIso, amended: true, adjRef: a.ref, sub: x.sub + ` · value date amended ${a.ref}` }
            : x
        );
      } else {
        transactions = transactions.map((x) => (x.ref === a.targetRef ? { ...x, reversed: true, adjRef: a.ref } : x));

        const contraDirection: "credit" | "debit" = t.direction === "credit" ? "debit" : "credit";
        const contra: Transaction = {
          date: today(),
          time: clockTime(),
          valueIso: a.valueIso,
          ref: `${a.ref}-R`,
          channel: "Ledger adjustment",
          corridor: t.corridor,
          route: "Ledger adjustment",
          counterparty: t.counterparty || "—",
          description: `Reversal of ${t.ref} — ${t.description}`,
          sub: `${a.reason} · contra entry · adjustment ${a.ref}`,
          status: "Completed",
          currency: t.currency,
          amount: t.amount,
          direction: contraDirection,
          reversed: false,
          isAdjustment: true,
          adjRef: a.ref,
        };
        applyEffect(t.currency, t.amount, contraDirection);
        transactions = [contra, ...transactions];

        if (a.type === "correction") {
          const replacement: Transaction = {
            date: today(),
            time: clockTime(),
            valueIso: a.valueIso,
            ref: `${a.ref}-C`,
            channel: "Ledger adjustment",
            corridor: t.corridor,
            route: "Ledger adjustment",
            counterparty: t.counterparty || "—",
            description: a.narrative || t.description,
            sub: `${a.reason} · replaces ${t.ref} · adjustment ${a.ref}`,
            status: "Completed",
            currency: t.currency,
            amount: a.amount,
            direction: t.direction,
            reversed: false,
            isAdjustment: true,
            adjRef: a.ref,
          };
          applyEffect(t.currency, a.amount, t.direction);
          transactions = [replacement, ...transactions];
        }
      }

      const notice: Message = {
        id: "m" + (s.messages.length + 1 + Math.floor(Math.random() * 1000)),
        to: s.user.id,
        category: "Account update",
        priority: "Normal",
        subject: "An adjustment has been posted to your account",
        body: `Adjustment ${a.ref} (${TYPE_LABEL[a.type].toLowerCase()}) has been posted against entry ${a.targetRef} with a value date of ${isoToDisplay(
          a.valueIso
        )}.\n\nReason: ${a.reason}.\n\nThe original entry remains on your statement and is marked accordingly. If this adjustment is not what you expected, contact the institution through the number on your card.`,
        sentAt: stamp(),
        sentBy: "Automated notice",
        read: false,
      };

      return {
        ...s,
        transactions,
        balances,
        messages: [notice, ...s.messages],
        adjustments: s.adjustments.map((x) =>
          x.ref === a.ref ? { ...x, status: "Posted" as const, checker: session.display, decidedAt: bookedAt, bookedAt } : x
        ),
      };
    });
  }

  const pending = store.adjustments.filter((a) => a.status === "Pending authorisation");

  return (
    <>
      <PageHead
        title="Ledger Adjustments"
        lede="Reversals, corrections and value-date amendments. A posted entry is never mutated — corrections post a contra plus a fresh entry."
      />

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber flex items-center justify-center">
            <RefreshCw size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Raise an Adjustment</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">Nothing touches the ledger until a second officer authorises it</p>
          </div>
        </div>

        <div className="px-4.5 sm:px-5 py-4">
          {confirmMsg ? (
            <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-4">
              <h3 className="text-pos font-bold mb-1.5 text-sm">Raised for authorisation</h3>
              <p className="m-0 text-xs">{confirmMsg}</p>
            </div>
          ) : null}

          <FormGrid>
            <Field label="Entry" required wide error={errors.txn}>
              <Select value={targetRef} onChange={(e) => selectTarget(e.target.value)}>
                <option value="">Select an entry…</option>
                {adjustable.map((t) => (
                  <option key={t.ref} value={t.ref}>
                    {t.ref} · {isoToDisplay(t.valueIso)} · {sign(t.direction)}
                    {formatCode(t.amount, t.currency)} · {t.description}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={type} onChange={(e) => setType(e.target.value as AdjType)}>
                <option value="reversal">Reversal</option>
                <option value="correction">Correction</option>
                <option value="valuedate">Value-date amendment</option>
              </Select>
            </Field>
            <Field label="Reason">
              <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                {store.adjustmentReasons.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Value date" error={errors.value}>
              <input
                type="date"
                value={valueDate}
                min={ACCOUNT_OPENED_ISO}
                max={todayIso()}
                onChange={(e) => setValueDate(e.target.value)}
                className="w-full text-[13px] px-2.5 py-2 border border-border bg-white rounded-lg focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
              />
            </Field>
            {type === "correction" ? (
              <>
                <Field label="Corrected amount" error={errors.amount}>
                  <TextInput value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" hasError={!!errors.amount} />
                </Field>
                <Field label="Narrative" wide>
                  <TextInput value={narrative} onChange={(e) => setNarrative(e.target.value)} />
                </Field>
              </>
            ) : null}
            <Field label="Reason note" required wide error={errors.note}>
              <TextArea value={note} onChange={(e) => setNote(e.target.value)} hasError={!!errors.note} className="min-h-[70px]" />
            </Field>
          </FormGrid>

          {target ? (
            <div className="mt-4 bg-tint border border-border-lt rounded-xl px-4 py-3.5">
              <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Effect on the ledger</p>
              {[
                ["Original entry", `${target.ref} · ${formatCode(target.amount, target.currency)}`],
                ["Original value date", isoToDisplay(target.valueIso)],
                ...(type === "reversal"
                  ? [
                      ["Original marked", "Reversed — retained on statement"],
                      ["Contra entry posted", `${sign(target.direction === "credit" ? "debit" : "credit")}${formatCode(target.amount, target.currency)}`],
                    ]
                  : type === "correction"
                    ? [
                        ["Original marked", "Reversed — retained on statement"],
                        ["Contra entry posted", `${sign(target.direction === "credit" ? "debit" : "credit")}${formatCode(target.amount, target.currency)}`],
                        [
                          "Replacement entry",
                          amount && isFinite(parseFloat(amount)) && parseFloat(amount) > 0
                            ? `${sign(target.direction)}${formatCode(parseFloat(amount), target.currency)}`
                            : "enter a corrected amount",
                        ],
                      ]
                    : [
                        ["Original retained", "Amount unchanged"],
                        ["Value date moves to", isoToDisplay(valueDate)],
                      ]),
                ["Booking date", "Set by the system on authorisation"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-dotted border-border text-[12px] last:border-b-0">
                  <span className="text-ink-2">{k}</span>
                  <span className="font-semibold text-ink">{v}</span>
                </div>
              ))}
            </div>
          ) : null}

          <FormActions className="mt-4">
            <Btn variant="primary" onClick={submit}>
              Raise for Authorisation
            </Btn>
            <Btn onClick={clearForm}>Clear</Btn>
          </FormActions>
        </div>
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Pending Authorisation</h3>
          <p className="m-0 mt-0.5 text-[11px] text-ink-2">
            {pending.length} {pending.length === 1 ? "item" : "items"}
          </p>
        </div>
        {pending.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">Nothing awaiting authorisation.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {pending.map((a) => {
              const sameOfficer = session.display === a.maker;
              return (
                <div key={a.ref} className="flex flex-wrap items-start gap-3 px-4.5 sm:px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-num font-bold text-[13px] text-navy">{a.ref}</span>
                      <Tag variant="review">{TYPE_LABEL[a.type]}</Tag>
                    </div>
                    <p className="m-0 mt-0.5 text-[12px] text-ink">
                      {a.targetRef} · {a.reason}
                    </p>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2">{a.note}</p>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                      Raised by {a.maker} · {a.raisedAt} · value date {isoToDisplay(a.valueIso)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <button
                      type="button"
                      disabled={sameOfficer}
                      title={sameOfficer ? "An adjustment cannot be authorised by the officer who raised it." : undefined}
                      onClick={() => decide(a, true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#166138] bg-gradient-to-b from-[#2C9159] to-[#1C7A46] px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                    >
                      Authorise
                    </button>
                    <button
                      type="button"
                      disabled={sameOfficer}
                      onClick={() => decide(a, false)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#9E2D22] bg-gradient-to-b from-[#D0503F] to-neg px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                    >
                      Reject
                    </button>
                  </div>
                  {sameOfficer ? <p className="w-full m-0 text-[11px] text-ink-2">Requires the other officer.</p> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <Scale size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Register</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {store.adjustments.length} {store.adjustments.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>
        {store.adjustments.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No adjustments raised.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {store.adjustments.map((a) => (
              <div key={a.ref} className="flex flex-wrap items-start justify-between gap-3 px-4.5 sm:px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-num font-bold text-[12.5px] text-navy">{a.ref}</span>
                    <Tag variant={adjTagVariant(a.status)}>{a.status}</Tag>
                    <span className="text-[11px] text-ink-2">{TYPE_LABEL[a.type]}</span>
                  </div>
                  <p className="m-0 mt-0.5 text-[11.5px] text-ink-2">
                    {a.targetRef} · {a.reason}
                  </p>
                </div>
                <div className="text-right text-[11px] text-ink-2 flex-none">
                  <p className="m-0">
                    Raised: {a.maker} · {a.raisedAt}
                  </p>
                  <p className="m-0">{a.checker ? `${a.status === "Posted" ? "Authorised" : "Rejected"}: ${a.checker} · ${a.decidedAt}` : "Awaiting authorisation"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Note>
        Backdating is expressed through the value date; the booking date is set by the system and never by an operator. Every posting is
        dual-controlled and attributed.
      </Note>
    </>
  );
}
