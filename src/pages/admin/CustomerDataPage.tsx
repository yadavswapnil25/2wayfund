import { useState } from "react";
import { Database, UserCog } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { CIF_FORMATS } from "../../lib/validators";
import { stamp } from "../../lib/dates";
import { displayMoney, formatCode } from "../../lib/format";
import { generateRef } from "../../lib/refs";
import type { CurrencyCode, MaintenanceEntry, Message } from "../../types/data";

type CifKind = keyof typeof CIF_FORMATS;

interface CifField {
  key: "reference" | "pan" | "account";
  label: string;
  kind: CifKind;
  note: string;
}

const CIF_FIELDS: CifField[] = [
  { key: "reference", label: "Customer ID", kind: "reference", note: "Primary customer identifier shown on statements and receipts." },
  { key: "pan", label: "PAN number", kind: "pan", note: "Tax identification number held against the customer record." },
  { key: "account", label: "Account number", kind: "account", note: "One number serves every currency ledger on this account." },
];

function maintTagVariant(status: MaintenanceEntry["status"]): string {
  if (status === "Applied") return "approved";
  if (status === "Rejected") return "rejected";
  return "review";
}

export function CustomerDataPage() {
  const { store, setStore, session, balancesHidden } = useApp();

  function fieldValue(field: CifField): string {
    return field.key === "account" ? store.user.accountNumber : field.key === "pan" ? store.user.pan : store.user.reference;
  }
  function applyFieldValue(field: CifField, value: string, u: typeof store.user): typeof store.user {
    if (field.key === "account") return { ...u, accountNumber: value };
    if (field.key === "pan") return { ...u, pan: value };
    return { ...u, reference: value };
  }

  const inFlight = store.transactions.filter((t) => !t.reversed && (t.status === "Processing" || t.status === "Under review" || t.status === "Pending"));

  function blockReason(field: CifField): string | null {
    if (field.key !== "account" || inFlight.length === 0) return null;
    return `The account has ${inFlight.length} ${inFlight.length === 1 ? "entry" : "entries"} in flight (${inFlight
      .map((t) => `${t.ref || "unreferenced"} · ${t.currency}`)
      .join(", ")}). Amend the account number once they settle.`;
  }

  const [fieldKey, setFieldKey] = useState<CifField["key"]>("reference");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState(store.maintenanceReasons[0] ?? "");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const field = CIF_FIELDS.find((f) => f.key === fieldKey)!;
  const blocked = blockReason(field);

  function clearForm() {
    setNewValue("");
    setReason(store.maintenanceReasons[0] ?? "");
    setNote("");
    setErrors({});
  }

  function submit() {
    if (blocked) {
      setErr("value", blocked);
      return;
    }
    let ok = true;
    const v = newValue.trim().toUpperCase();
    if (!v) {
      setErr("value", "Enter a new value.");
      ok = false;
    } else if (!CIF_FORMATS[field.kind].re.test(v)) {
      setErr("value", CIF_FORMATS[field.kind].hint);
      ok = false;
    } else if (v === fieldValue(field)) {
      setErr("value", "The new value matches the current one.");
      ok = false;
    } else setErr("value", null);

    if (note.trim().length < 15) {
      setErr("note", "Give a reason narrative of at least 15 characters — it is retained permanently.");
      ok = false;
    } else setErr("note", null);

    if (!ok) return;

    const entry: MaintenanceEntry = {
      ref: generateRef("2WF-CIF-", 7700, store.maintenance.length),
      key: field.key,
      label: field.label,
      before: fieldValue(field),
      after: v,
      reason,
      note: note.trim(),
      status: "Pending authorisation",
      maker: session.display,
      raisedAt: stamp(),
      checker: null,
      decidedAt: null,
    };

    setStore((s) => ({ ...s, maintenance: [entry, ...s.maintenance] }));
    clearForm();
    setConfirmMsg(`${field.label} will change from ${entry.before} to ${entry.after} once a second officer authorises it. The record is unchanged until then.`);
  }

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function decideMaintenance(m: MaintenanceEntry, approve: boolean) {
    setStore((s) => {
      const f = CIF_FIELDS.find((x) => x.key === m.key);
      const current = f ? fieldValue(f) : null;

      if (!approve) {
        return {
          ...s,
          maintenance: s.maintenance.map((x) => (x.ref === m.ref ? { ...x, status: "Rejected" as const, checker: session.display, decidedAt: stamp() } : x)),
        };
      }
      if (!f || current !== m.before) {
        return {
          ...s,
          maintenance: s.maintenance.map((x) =>
            x.ref === m.ref
              ? { ...x, status: "Rejected" as const, checker: session.display, decidedAt: stamp(), note: x.note + " [current value changed since the amendment was raised]" }
              : x
          ),
        };
      }

      const notice: Message = {
        id: "m" + (s.messages.length + 1 + Math.floor(Math.random() * 1000)),
        to: s.user.id,
        category: "Account update",
        priority: "High",
        subject: "A detail on your record has been updated",
        body: `${m.label} has been amended from ${m.before} to ${m.after}.\n\nReason: ${m.reason}.\n\nAuthorised by two officers and recorded on the maintenance register. If you did not expect this change, contact the institution on the number on your card. We will never ask you to confirm it by disclosing a password or one-time code.`,
        sentAt: stamp(),
        sentBy: "Automated notice",
        read: false,
      };

      return {
        ...s,
        user: applyFieldValue(f, m.after, s.user),
        messages: [notice, ...s.messages],
        maintenance: s.maintenance.map((x) => (x.ref === m.ref ? { ...x, status: "Applied" as const, checker: session.display, decidedAt: stamp() } : x)),
      };
    });
  }

  // Ledger catalogue
  const openCurrencies = new Set(store.balances.map((b) => b.currency));
  const allCurrencies = Object.keys(store.rates) as CurrencyCode[];
  const openable = allCurrencies.filter((c) => !openCurrencies.has(c));

  const [openCurrency, setOpenCurrency] = useState<CurrencyCode | "">(openable[0] ?? "");
  const [ledgerNote, setLedgerNote] = useState("");
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerConfirm, setLedgerConfirm] = useState<string | null>(null);

  function openLedger() {
    if (!openCurrency || openCurrencies.has(openCurrency)) {
      setLedgerError("Select a currency that is not already open.");
      return;
    }
    setLedgerError(null);
    const currency = openCurrency;
    const noteText = ledgerNote.trim() || `Opened by ${session.display}`;
    const ref = "2WF-LGR-" + (100 + store.ledgerEvents.length + 1);

    const notice: Message = {
      id: "m" + (store.messages.length + 1 + Math.floor(Math.random() * 1000)),
      to: store.user.id,
      category: "Account update",
      priority: "Normal",
      subject: `A new ${currency} ledger has been opened on your account`,
      body: `A ${currency} ledger has been opened on your account and is now shown on your Account Summary and Currency Ledgers pages with an opening balance of ${formatCode(
        0,
        currency
      )}. Note: ${noteText}.\n\nIf you did not expect this, contact the institution on the number on your card.`,
      sentAt: stamp(),
      sentBy: "Automated notice",
      read: false,
    };

    setStore((s) => ({
      ...s,
      balances: [...s.balances, { currency, amount: 0, note: noteText }],
      ledgerEvents: [{ ref, currency, note: noteText, officer: session.display, at: stamp() }, ...s.ledgerEvents],
      messages: [notice, ...s.messages],
    }));

    setLedgerNote("");
    setOpenCurrency((openable.filter((c) => c !== currency)[0] ?? "") as CurrencyCode | "");
    setLedgerConfirm(`${currency} ledger opened with a zero balance and reflected immediately on the customer's account.`);
  }

  const pending = store.maintenance.filter((m) => m.status === "Pending authorisation");

  return (
    <>
      <PageHead title="Customer Data Maintenance" lede="Amend a customer identifier under dual control. The previous value is always retained." />

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <UserCog size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Current Identifiers</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {store.user.name} · {store.user.accountTier}
            </p>
          </div>
        </div>
        <div className="divide-y divide-border-lt">
          {CIF_FIELDS.map((f) => {
            const b = blockReason(f);
            return (
              <div key={f.key} className="flex flex-wrap items-center justify-between gap-3 px-4.5 sm:px-5 py-3">
                <div className="min-w-0">
                  <p className="m-0 text-[12.5px] font-semibold text-ink">{f.label}</p>
                  <p className="m-0 mt-0.5 font-num text-[12.5px] text-navy">{fieldValue(f)}</p>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2">{f.note}</p>
                </div>
                {f.key === "account" ? <Tag variant={b ? "review" : "approved"}>{b ? String(inFlight.length) : "Clear"}</Tag> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Amend an Identifier</h3>
        </div>
        <div className="px-4.5 sm:px-5 py-4">
          {confirmMsg ? (
            <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-4">
              <h3 className="text-pos font-bold mb-1.5 text-sm">Raised for authorisation</h3>
              <p className="m-0 text-xs">{confirmMsg}</p>
            </div>
          ) : null}
          {blocked ? <Note danger className="mb-3.5">{blocked}</Note> : null}

          <FormGrid>
            <Field label="Field">
              <Select
                value={fieldKey}
                onChange={(e) => {
                  setFieldKey(e.target.value as CifField["key"]);
                  setNewValue("");
                  setErrors({});
                }}
              >
                {CIF_FIELDS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Current value">
              <TextInput value={fieldValue(field)} readOnly className="bg-tint" />
            </Field>
            <Field label="New value" required wide error={errors.value} hint={!errors.value ? CIF_FORMATS[field.kind].hint : undefined}>
              <TextInput value={newValue} onChange={(e) => setNewValue(e.target.value)} hasError={!!errors.value} autoComplete="off" />
            </Field>
            <Field label="Reason">
              <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                {store.maintenanceReasons.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Holder">
              <TextInput value={`${store.user.name} · ${store.user.accountTier}`} readOnly className="bg-tint" />
            </Field>
            <Field label="Reason note" required wide error={errors.note}>
              <TextArea value={note} onChange={(e) => setNote(e.target.value)} hasError={!!errors.note} className="min-h-[70px]" />
            </Field>
            <FormActions>
              <Btn variant="primary" onClick={submit}>
                Raise for Authorisation
              </Btn>
              <Btn onClick={clearForm}>Clear</Btn>
            </FormActions>
          </FormGrid>
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
            {pending.map((m) => {
              const sameOfficer = session.display === m.maker;
              return (
                <div key={m.ref} className="flex flex-wrap items-start gap-3 px-4.5 sm:px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[12.5px] font-semibold text-ink">{m.label}</p>
                    <p className="m-0 mt-0.5 font-num text-[12.5px] text-navy">
                      {m.before} → {m.after}
                    </p>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                      {m.reason} · {m.note}
                    </p>
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                      Raised by {m.maker} · {m.raisedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <button
                      type="button"
                      disabled={sameOfficer}
                      title={sameOfficer ? "An amendment cannot be authorised by the officer who raised it." : undefined}
                      onClick={() => decideMaintenance(m, true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#166138] bg-gradient-to-b from-[#2C9159] to-[#1C7A46] px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                    >
                      Authorise
                    </button>
                    <button
                      type="button"
                      disabled={sameOfficer}
                      onClick={() => decideMaintenance(m, false)}
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
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Register</h3>
          <p className="m-0 mt-0.5 text-[11px] text-ink-2">
            {store.maintenance.length} {store.maintenance.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        {store.maintenance.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No amendments raised.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {store.maintenance.map((m) => (
              <div key={m.ref} className="flex flex-wrap items-start justify-between gap-3 px-4.5 sm:px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-num font-bold text-[12.5px] text-navy">{m.ref}</span>
                    <Tag variant={maintTagVariant(m.status)}>{m.status}</Tag>
                  </div>
                  <p className="m-0 mt-0.5 text-[11.5px] text-ink-2">
                    {m.label}: {m.before} → {m.after}
                  </p>
                </div>
                <div className="text-right text-[11px] text-ink-2 flex-none">
                  <p className="m-0">
                    Raised: {m.maker} · {m.raisedAt}
                  </p>
                  <p className="m-0">{m.checker ? `${m.status === "Applied" ? "Authorised" : "Rejected"}: ${m.checker} · ${m.decidedAt}` : "Awaiting authorisation"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#F4EEFB] text-purple-600 flex items-center justify-center">
            <Database size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Ledger Catalogue</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {store.balances.length} of {allCurrencies.length} supported currencies open
            </p>
          </div>
        </div>
        <div className="divide-y divide-border-lt">
          {allCurrencies.map((c) => {
            const bal = store.balances.find((b) => b.currency === c);
            return (
              <div key={c} className="flex items-center justify-between gap-3 px-4.5 sm:px-5 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex-none w-8 h-8 rounded-full bg-tint text-navy text-[10.5px] font-bold flex items-center justify-center">{c}</span>
                  <span className="text-[12px] text-ink-2 truncate">{bal ? bal.note : "Available for the Compliance Console to open"}</span>
                </div>
                <div className="flex items-center gap-3 flex-none">
                  {bal ? <span className="font-num tabular-nums text-[12px] font-semibold text-navy">{displayMoney(bal.amount, bal.currency, balancesHidden)}</span> : null}
                  <Tag variant={bal ? "approved" : "submitted"}>{bal ? "Open" : "Not opened"}</Tag>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4.5 sm:px-5 py-4 border-t border-border-lt">
          {ledgerConfirm ? (
            <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3.5">
              <h3 className="text-pos font-bold mb-1.5 text-sm">Ledger opened</h3>
              <p className="m-0 text-xs">{ledgerConfirm}</p>
            </div>
          ) : null}
          {ledgerError ? <Note danger className="mb-3.5">{ledgerError}</Note> : null}
          <FormGrid>
            <Field label="Currency to open">
              <Select value={openCurrency} onChange={(e) => setOpenCurrency(e.target.value as CurrencyCode)} disabled={openable.length === 0}>
                {openable.length === 0 ? (
                  <option value="">All supported currencies are already open</option>
                ) : (
                  openable.map((c) => <option key={c}>{c}</option>)
                )}
              </Select>
            </Field>
            <Field label="Note" wide>
              <TextInput value={ledgerNote} onChange={(e) => setLedgerNote(e.target.value)} />
            </Field>
          </FormGrid>
          <Btn variant="primary" onClick={openLedger} className="mt-3.5" disabled={openable.length === 0}>
            Open Ledger
          </Btn>
        </div>
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Ledger-Opening Log</h3>
        </div>
        {store.ledgerEvents.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No ledgers opened yet by the back office.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {store.ledgerEvents.map((e) => (
              <div key={e.ref} className="flex flex-wrap items-center justify-between gap-3 px-4.5 sm:px-5 py-2.5">
                <div className="min-w-0">
                  <span className="font-num font-bold text-[12px] text-navy">{e.ref}</span>
                  <span className="ml-2 text-[12px] font-semibold text-ink">{e.currency}</span>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">{e.note}</p>
                </div>
                <span className="text-[11px] text-ink-2 flex-none">
                  {e.officer} · {e.at}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
