import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Printer } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, DetailGrid, Note, ReviewLine } from "../../components/ui/Misc";
import { Stepper, WizActions } from "../../components/ui/Stepper";
import { Tag } from "../../components/ui/Tag";
import { Modal } from "../../components/ui/Modal";
import { useApp } from "../../state/AppContext";
import { TRANSFER_CHANNELS } from "../../data/constants";
import { beneCodeLabel, beneficiaryRestrictionReason, corridorFor, isAllowedBeneficiary, isHeld, transferChannel, txQuote } from "../../lib/transfer";
import { displayMoney, formatCode } from "../../lib/format";
import { amountInWordsInr } from "../../lib/words";
import { clockTime, today, todayIso } from "../../lib/dates";
import type { Transaction } from "../../types/data";

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const d = cleaned.indexOf(".");
  const clean2 = d !== -1 ? cleaned.slice(0, d + 1) + cleaned.slice(d + 1).replace(/\./g, "") : cleaned;
  const n = parseFloat(clean2);
  return isFinite(n) && n > 0 ? n : 0;
}

interface Receipt {
  reference: string;
  utr: string;
  held: boolean;
  debit: number;
  commission: number;
  commissionRate: number;
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccount: string;
  routing: string;
  channelLabel: string;
  clearing: string;
  balance: number;
}

export function TransferFundsPage() {
  const { store, setStore, balancesHidden } = useApp();
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [beneId, setBeneId] = useState("");
  const [channelId, setChannelId] = useState<"IMPS" | "NEFT" | "RTGS">("IMPS");
  const [amountRaw, setAmountRaw] = useState("");
  const [remarks, setRemarks] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  const [pin, setPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);

  const beneficiary = store.beneficiaries.find((b) => b.id === beneId) || null;
  const amount = parseAmount(amountRaw);
  const channel = transferChannel(channelId);
  const inrLedger = store.balances.find((b) => b.currency === "INR")!;
  const quote = beneficiary ? txQuote(store, amount, beneficiary) : null;

  function resetAll() {
    setStage(1);
    setBeneId("");
    setChannelId("IMPS");
    setAmountRaw("");
    setRemarks("");
    setAmountError(null);
    setPin("");
    setPinError(null);
    setReceipt(null);
  }

  function goToReview() {
    if (!beneficiary) {
      setAmountError("Select a beneficiary to continue.");
      return;
    }
    if (beneficiary.status !== "Verified") {
      setAmountError(`${beneficiary.name} is within its post-registration cooling-off period and cannot receive a transfer yet.`);
      return;
    }
    if (!(amount > 0)) {
      setAmountError("Enter an amount greater than zero.");
      return;
    }
    if (channel.minAmount && amount < channel.minAmount) {
      setAmountError(`RTGS requires a minimum of ${formatCode(channel.minAmount, "INR")}.`);
      return;
    }
    if (amount > inrLedger.amount) {
      setAmountError(`Amount exceeds the available balance in the INR ledger (${formatCode(inrLedger.amount, "INR")}).`);
      return;
    }
    const restrict = beneficiaryRestrictionReason(beneficiary);
    if (restrict) {
      setAmountError(restrict);
      return;
    }
    setAmountError(null);
    setPin("");
    setPinError(null);
    setStage(2);
  }

  function authorize() {
    if (!/^\d{9}$/.test(pin)) {
      setPinError("Enter your 9-digit transaction PIN.");
      return;
    }
    if (pin !== store.user.pin) {
      setPinError("Incorrect PIN. Check your 9-digit transaction PIN and try again.");
      return;
    }
    if (!beneficiary || !quote) return;
    setPinError(null);

    const txRefCounter = store.transactions.length + 88215;
    const reference = "2WF-TXN-" + todayIso().replace(/-/g, "") + "-" + String(txRefCounter).padStart(5, "0");
    const utr = "UTR" + String(500000000000 + txRefCounter).slice(0, 12);
    const held = isHeld(quote);
    const newBalance = inrLedger.amount - quote.debit;
    const beneficiaryBank = beneficiary.bankName || (beneficiary.internal ? "2 Way Fund International" : beneficiary.detail);

    const status: Transaction["status"] = held ? "Under review" : "Completed";

    setStore((s) => {
      const balances = s.balances.map((b) => (b.currency === "INR" ? { ...b, amount: b.amount - quote.debit } : b));
      const transactions: Transaction[] = [
        {
          date: today(),
          time: clockTime(),
          valueIso: todayIso(),
          reversed: false,
          ref: reference,
          utr,
          corridor: corridorFor(beneficiary.country),
          route: beneficiary.ifsc ? `IFSC ${beneficiary.ifsc}` : beneficiary.internal ? "On-platform" : "—",
          counterparty: beneficiary.country,
          channel: channel.label + " transfer",
          beneficiary: beneficiary.name,
          beneficiaryAccount: beneficiary.account,
          beneficiaryBank,
          routing: beneCodeLabel(beneficiary),
          commission: quote.commission,
          commissionCurrency: "INR",
          receives: quote.receives,
          receivesCurrency: beneficiary.currency,
          description: (beneficiary.internal ? "Internal transfer — " : "Beneficiary payout — ") + beneficiary.name,
          sub: channel.label + " · " + (held ? "Held for compliance screening · ref " + reference : "Settled · ref " + reference),
          status,
          currency: "INR",
          amount,
          direction: "debit",
        },
        ...(quote.commission > 0
          ? [
              {
                date: today(),
                time: clockTime(),
                valueIso: todayIso(),
                reversed: false,
                ref: reference + "-C",
                corridor: corridorFor(beneficiary.country),
                route: "Charge",
                counterparty: beneficiary.country,
                channel: "Commission",
                description: "Commission — standard transaction 2%, charged to sender",
                sub: "Applied to " + reference,
                status: "Completed" as const,
                currency: "INR" as const,
                amount: quote.commission,
                direction: "debit" as const,
              },
            ]
          : []),
        ...s.transactions,
      ];
      return { ...s, balances, transactions };
    });

    setReceipt({
      reference,
      utr,
      held,
      debit: quote.debit,
      commission: quote.commission,
      commissionRate: quote.commissionRate,
      beneficiaryName: beneficiary.name,
      beneficiaryBank,
      beneficiaryAccount: beneficiary.account,
      routing: beneCodeLabel(beneficiary),
      channelLabel: channel.label,
      clearing: channel.clearing,
      balance: newBalance,
    });
    setStage(3);
  }

  return (
    <>
      <PageHead
        title="Electronic Fund Transfer"
        lede="Transfer to Indian Commercial Banks (IMPS / NEFT / RTGS) or internal 2 Way Fund accounts. No money moves — settlement is simulated against the in-memory ledger."
      />

      <Panel>
        <Stepper
          current={stage}
          steps={[
            { label: "Details", sub: "Policy steps 3–4" },
            { label: "Review & PIN", sub: "Policy steps 5–7" },
            { label: "Receipt", sub: "Policy steps 8–11" },
          ]}
        />

        {stage === 1 ? (
          <div className="p-4.5">
            <div className="flex items-center justify-between gap-3.5 flex-wrap bg-tint border border-border-lt rounded-lg px-4 py-3.5 mb-4.5">
              <div>
                <span className="text-[10.5px] uppercase text-ink-2 font-semibold">From account (debit)</span>
                <strong className="block mt-0.5 text-sm text-navy">Saving Account · {store.user.accountNumber}</strong>
              </div>
              <div className="text-right">
                <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Available funds</span>
                <div className="font-num tabular-nums text-[17px] font-bold text-navy mt-0.5">{displayMoney(inrLedger.amount, "INR", balancesHidden)}</div>
              </div>
            </div>

            <Field
              label={
                <span className="flex items-center justify-between w-full">
                  Select Beneficiary Payee <Link to="/beneficiaries" className="text-xs font-normal">+ Add New Indian Bank Payee</Link>
                </span>
              }
              required
              wide
            >
              <select
                value={beneId}
                onChange={(e) => setBeneId(e.target.value)}
                className="w-full text-[13px] px-2.5 py-2 border border-border bg-white rounded-[5px]"
              >
                <option value="">Select a beneficiary…</option>
                {store.beneficiaries.map((b) => {
                  const notAllowed = !isAllowedBeneficiary(b);
                  const blockedVerify = b.status !== "Verified";
                  return (
                    <option key={b.id} value={b.id} disabled={notAllowed}>
                      {b.name} — {b.internal ? "2 Way Fund internal, no charge" : `${b.country}, ${b.currency} · 2% commission`}
                      {blockedVerify ? " (pending verification)" : ""}
                      {notAllowed ? " (restricted from INR)" : ""}
                    </option>
                  );
                })}
              </select>
            </Field>

            {beneficiary ? (
              <div className="bg-tint border border-border-lt px-3.5 py-3 mt-3 text-[12.5px]">
                <ReviewLine k="Account" v={beneficiary.account} />
                <ReviewLine k="Routing" v={beneCodeLabel(beneficiary)} />
                <ReviewLine k="Country / currency" v={`${beneficiary.country} · ${beneficiary.currency}`} />
                <ReviewLine k="Transfer type" v={beneficiary.internal ? "Internal — no charge" : "External — 2% commission"} />
                <div className="flex items-center justify-between py-2 text-[12.5px]">
                  <span>Status</span>
                  <Tag variant={beneficiary.status === "Verified" ? "approved" : "review"}>{beneficiary.status}</Tag>
                </div>
              </div>
            ) : null}

            <Field label="Transfer Payment Mode" required wide className="mt-4.5">
              <div className="grid grid-cols-3 gap-2.5 max-[560px]:grid-cols-1 mt-1.5">
                {TRANSFER_CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannelId(c.id)}
                    className={`px-2.5 py-3 text-center rounded-lg border cursor-pointer ${
                      channelId === c.id ? "border-navy-lt bg-[#EAF1F9] shadow-[inset_0_0_0_1px_var(--color-navy-lt)]" : "border-border bg-white"
                    }`}
                  >
                    <strong className={`block text-[13px] font-bold ${channelId === c.id ? "text-navy" : "text-ink"}`}>{c.label}</strong>
                    <span className="block mt-0.5 text-[10.5px] text-ink-2">{c.sub}</span>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4 mt-4.5 max-[560px]:grid-cols-1">
              <Field label="Transfer Amount (INR)" required error={amountError}>
                <TextInput inputMode="decimal" value={amountRaw} onChange={(e) => setAmountRaw(e.target.value)} placeholder="₹ 0.00" hasError={!!amountError} />
              </Field>
              <Field label="Transaction Remarks / Purpose" wide>
                <TextInput value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. Vendor payment, Medical, Monthly bills" />
              </Field>
            </div>

            <WizActions>
              <Btn variant="block" onClick={goToReview}>
                Proceed to Review &amp; Authorization →
              </Btn>
            </WizActions>
          </div>
        ) : null}

        {stage === 2 && beneficiary && quote ? (
          <div className="p-4.5">
            <Callout title="Review Transaction Details">
              <p>Please verify the beneficiary account and transfer mode before final submission.</p>
            </Callout>

            <DetailGrid
              items={[
                ["Debit account", store.user.accountNumber, store.user.name],
                ["Beneficiary payee", beneficiary.name, beneficiary.bankName || (beneficiary.internal ? "2 Way Fund International" : beneficiary.detail)],
                ["Beneficiary account no", beneficiary.account],
                ["IFSC / routing code", beneCodeLabel(beneficiary)],
                ["Transfer channel", channel.label, channel.sub],
                ["Transaction charges", quote.commissionRate ? `${formatCode(quote.commission, "INR")} (2%)` : `${formatCode(0, "INR")} (Nil)`],
              ]}
            />

            <div className="flex items-center justify-between gap-3.5 flex-wrap bg-tint border border-border-lt rounded-lg px-4 py-3.5 mt-4">
              <div>
                <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Total amount to debit</span>
                <div className="font-num tabular-nums text-[22px] font-bold text-navy mt-0.5">{displayMoney(quote.debit, "INR", balancesHidden)}</div>
                <span className="text-[11px] text-ink-2">{amountInWordsInr(quote.debit)} Only</span>
              </div>
              <Tag variant="processing">{channel.clearing}</Tag>
            </div>

            <div className="border border-border border-l-4 border-l-gold rounded-lg px-3.5 py-3 mt-4.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-[13.5px] font-bold text-navy m-0">🔒 Enter 9-Digit Transaction Security PIN</h3>
                <button type="button" onClick={() => setPinVisible((v) => !v)} className="text-navy-lt text-xs font-semibold hover:underline flex items-center gap-1">
                  {pinVisible ? <EyeOff size={13} /> : <Eye size={13} />} {pinVisible ? "Hide PIN" : "Show PIN"}
                </button>
              </div>
              <input
                type={pinVisible ? "text" : "password"}
                inputMode="numeric"
                maxLength={9}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
                placeholder="Enter your 9 numeric digits"
                className="w-full mt-2.5 text-[13px] px-2.5 py-2 border border-border rounded-[5px]"
              />
              <div className="flex items-center justify-between gap-2 flex-wrap mt-1.5">
                <span className="text-[11px] text-ink-2">Digits entered: {pin.length} / 9</span>
                <Link to="/pin-security" className="text-[11.5px]">
                  Set or Change 9-Digit PIN →
                </Link>
              </div>
              {pinError ? <div className="text-neg text-xs font-semibold mt-2">{pinError}</div> : null}
            </div>

            <WizActions>
              <Btn onClick={() => setStage(1)}>← Back to Edit</Btn>
              <Btn variant="approve" disabled={pin.length !== 9} onClick={authorize}>
                Authorize &amp; Transfer {formatCode(quote.debit, "INR")}
              </Btn>
            </WizActions>
          </div>
        ) : null}

        {stage === 3 && receipt ? (
          <div>
            <div className={`px-5 py-7 text-center border-b border-border-lt ${receipt.held ? "bg-[#FBF4E1]" : "bg-[#F0F8F3]"}`}>
              <div className={`w-11.5 h-11.5 rounded-full text-white text-[22px] flex items-center justify-center mx-auto mb-3 ${receipt.held ? "bg-amber" : "bg-pos"}`}>
                {receipt.held ? "!" : "✓"}
              </div>
              <h2 className="text-[19px] mb-1.5">{receipt.held ? "Submitted — Under Review" : "Payment Processed Successfully!"}</h2>
              <p className="m-0 text-ink-2 text-[12.5px]">
                {receipt.held
                  ? "Authorised and accepted, then held for compliance screening before settlement."
                  : "Amount debited and credited to beneficiary account. Core ledger transaction is finalised."}
              </p>
            </div>
            <div className="p-4.5">
              <ReviewLine k="Bank UTR Number" v={receipt.utr} />
              <ReviewLine k="Transaction Ref No" v={receipt.reference} />
              <ReviewLine k="Beneficiary Payee" v={receipt.beneficiaryName} />
              <ReviewLine k="Beneficiary Bank" v={receipt.beneficiaryBank} />
              <ReviewLine k="Amount Transferred" v={formatCode(receipt.debit, "INR")} kind="total" />
              <ReviewLine k="Updated Balance" v={displayMoney(receipt.balance, "INR", balancesHidden)} kind="total" />

              {receipt.held ? (
                <Note className="mt-2">
                  Value band screening flagged this transaction for manual review, so it appears on your ledger as <strong>Under review</strong>{" "}
                  rather than Completed. A reviewer adjudicates it before settlement.
                </Note>
              ) : null}
              <Note danger className="mt-2">
                No money moved. Settlement is simulated against an in-memory ledger and a page reload restores the seeded balances.
              </Note>

              <WizActions>
                <Btn variant="primary" onClick={() => setVoucherOpen(true)}>
                  Download / Print Official Receipt
                </Btn>
                <Btn onClick={resetAll}>Make Another Transfer</Btn>
                <Link to="/statements" className="inline-block border rounded-[5px] px-4 py-2 text-xs font-semibold bg-white border-border no-underline text-ink">
                  View in Passbook →
                </Link>
              </WizActions>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel>
        <PanelHead title="Policy Flow Mapping" note="11 steps" />
        <PanelBody>
          <ol className="list-none m-0 p-0 flex flex-wrap gap-1.5">
            {store.txFlow.map((step, i) => (
              <li key={i} className="bg-tint border border-border-lt rounded-full px-3 py-1.5 text-[12px]">
                {i + 1}. {step}
              </li>
            ))}
          </ol>
          <Note className="mt-3">
            Steps 1–2 are satisfied by the login you completed to reach this page. Steps 3–4 (select beneficiary, enter transaction) are the
            Details stage. Steps 5–7 (verify amount, transaction PIN, risk &amp; security check) are the Review &amp; PIN stage. Steps 8–11
            (processing through reference number) are the Receipt stage. The full control model is documented under Security &amp; KYC.
          </Note>
        </PanelBody>
      </Panel>

      {voucherOpen && receipt ? (
        <Modal
          title={
            <>
              🛡️ Official Bank Transaction Advisory Voucher
            </>
          }
          onClose={() => setVoucherOpen(false)}
          footerExtra={
            <Btn variant="primary" onClick={() => window.print()}>
              <Printer size={13} className="inline -mt-0.5 mr-1" /> Print Receipt
            </Btn>
          }
        >
          <span className="inline-block text-[9.5px] font-bold tracking-wide uppercase text-neg bg-[#FBEAE8] border border-[#E0AEA7] px-2 py-0.5 rounded mb-2.5">
            Academic demo — fictional record, no real funds moved
          </span>
          <h4 className="mb-1 text-[15px]">2 Way Fund International</h4>
          <p className="text-ink-2 text-[11.5px] mb-1">Core Electronic Settlement &amp; Clearing Advisory</p>
          <p className="text-ink-2 text-[11.5px] mb-3">
            IFSC: {store.user.ifsc} · MICR: {store.user.micr}
          </p>
          <Tag variant={receipt.held ? "review" : "completed"} className="!inline-block mb-3">
            Status: {receipt.held ? "Under Review" : "Successful"}
          </Tag>
          <ReviewLine k="Bank UTR Number" v={receipt.utr} />
          <ReviewLine k="Core Reference ID" v={receipt.reference} />
          <ReviewLine k="Transaction Date" v={`${todayIso()} ${clockTime()}`} />
          <ReviewLine k="Remitter Account" v={store.user.accountNumber} />
          <ReviewLine k="Beneficiary Payee" v={receipt.beneficiaryName} />
          <ReviewLine k="Beneficiary Bank" v={receipt.beneficiaryBank} />
          <ReviewLine k="Routing / IFSC Code" v={receipt.routing} />
          <ReviewLine k="Payment Channel" v={receipt.channelLabel} />
          <ReviewLine k="Settled Amount" v={formatCode(receipt.debit, "INR")} kind="total" />
          <p className="text-ink-2 text-[11.5px] italic mt-2">Amount in words: {amountInWordsInr(receipt.debit)} Only</p>
          <ReviewLine k="Closing Balance" v={displayMoney(receipt.balance, "INR", balancesHidden)} />
          <p className="text-xs text-ink-2 mt-3">This is a computer-generated bank electronic advisory. No physical signature is required under Indian IT Act 2000.</p>
          <p className="text-xs text-neg font-semibold">2 Way Fund International is a fictional institution created for this design prototype. No real funds were transferred.</p>
        </Modal>
      ) : null}
    </>
  );
}
