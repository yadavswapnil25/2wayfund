import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Eye, EyeOff, KeyRound, Landmark, Zap } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { DetailGrid, Note, ReviewLine } from "../../components/ui/Misc";
import { Stepper, WizActions } from "../../components/ui/Stepper";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { TRANSFER_CHANNELS } from "../../data/constants";
import { beneCodeLabel, beneficiaryRestrictionReason, isAllowedBeneficiary, transferChannel, txQuote } from "../../lib/transfer";
import { displayMoney, formatCode } from "../../lib/format";
import { amountInWordsInr } from "../../lib/words";
import { getMe, getBalances } from "../../services/meService";
import { listBeneficiaries } from "../../services/beneficiaryService";
import { createTransfer } from "../../services/transferService";
import { ApiError } from "../../services/apiClient";
import { TransferReceiptPanel, TransferVoucherModal, type TransferReceiptView } from "./TransferReceiptViews";
import type { Balance, Beneficiary } from "../../types/data";

const CHANNEL_ICONS: Record<string, typeof Zap> = { IMPS: Zap, NEFT: Landmark, RTGS: Building2 };

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const d = cleaned.indexOf(".");
  const clean2 = d !== -1 ? cleaned.slice(0, d + 1) + cleaned.slice(d + 1).replace(/\./g, "") : cleaned;
  const n = parseFloat(clean2);
  return isFinite(n) && n > 0 ? n : 0;
}

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches ExchangePage,
 * BeneficiariesPage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

export function TransferFundsPage() {
  const { store, setStore, session, balancesHidden } = useApp();
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [beneId, setBeneId] = useState("");
  const [channelId, setChannelId] = useState<"IMPS" | "NEFT" | "RTGS">("IMPS");
  const [amountRaw, setAmountRaw] = useState("");
  const [remarks, setRemarks] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  const [pin, setPin] = useState("");
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [receipt, setReceipt] = useState<TransferReceiptView | null>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(store.beneficiaries);
  const [balances, setBalances] = useState<Balance[]>(store.balances);

  // Seed data renders immediately, then is quietly replaced by real data —
  // the shared store is only fresh once some other page has loaded it, so
  // this page fetches its own copies rather than trusting it's current
  // (matches ExchangePage, PinSecurityPage).
  const loadBalances = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) return;
      try {
        const real = await getBalances(session.token, signal);
        setBalances(real);
      } catch {
        // Best-effort — the seed/last-known balances stay displayed.
      }
    },
    [session.token],
  );

  useEffect(() => {
    const controller = new AbortController();
    const token = session.token;
    if (!token) return;

    // Best-effort — on failure, the seed beneficiaries/profile stay displayed.
    const noop = () => undefined;
    void loadBalances(controller.signal);
    void listBeneficiaries(token, controller.signal).then(setBeneficiaries).catch(noop);
    void getMe(token, controller.signal)
      .then((me) => setStore((s) => ({ ...s, user: { ...s.user, ...me } })))
      .catch(noop);

    return () => controller.abort();
  }, [session.token, setStore, loadBalances]);

  const beneficiary = beneficiaries.find((b) => b.id === beneId) || null;
  const amount = parseAmount(amountRaw);
  const channel = transferChannel(channelId);
  const inrLedger = balances.find((b) => b.currency === "INR") ?? { currency: "INR" as const, amount: 0, note: "" };
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

  async function authorize() {
    if (!/^\d{9}$/.test(pin)) {
      setPinError("Enter your 9-digit transaction PIN.");
      return;
    }
    if (!beneficiary || !quote || !session.token || submitting) return;
    setPinError(null);
    setSubmitting(true);

    try {
      const result = await createTransfer(
        { beneficiaryId: beneficiary.id, channel: channelId, amount, remarks: remarks.trim() || undefined, pin },
        session.token,
      );

      setBalances((prev) => prev.map((b) => (b.currency === "INR" ? { ...b, amount: result.balance } : b)));
      setReceipt({
        reference: result.reference,
        utr: result.utr,
        held: result.held,
        debit: result.amount + result.commission,
        commission: result.commission,
        commissionRate: quote.commissionRate,
        beneficiaryName: result.beneficiaryName,
        beneficiaryBank: result.beneficiaryBank,
        beneficiaryAccount: result.beneficiaryAccount,
        routing: result.routing,
        channelLabel: channel.label,
        clearing: channel.clearing,
        balance: result.balance,
      });
      setStage(3);
    } catch (err) {
      setPinError(firstErrorMessage(err, "Could not authorize this transfer. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHead
        title="Electronic Fund Transfer"
        lede="Transfer to Indian Commercial Banks (IMPS / NEFT / RTGS) or internal 2 Way Fund accounts. Authorised by your 9-digit transaction PIN."
      />

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <Stepper
          current={stage}
          steps={[
            { label: "Details", sub: "Policy steps 3–4" },
            { label: "Review & PIN", sub: "Policy steps 5–7" },
            { label: "Receipt", sub: "Policy steps 8–11" },
          ]}
        />

        {stage === 1 ? (
          <div className="p-4.5 sm:p-5">
            <div className="flex items-center justify-between gap-3.5 flex-wrap rounded-2xl border border-border-lt bg-tint px-4.5 py-4 mb-4.5">
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
                className="w-full text-[13px] px-2.5 py-2 border border-border bg-white rounded-lg focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
              >
                <option value="">Select a beneficiary…</option>
                {beneficiaries.map((b) => {
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
              <div className="rounded-2xl border border-border-lt bg-tint px-4.5 py-3.5 mt-3 text-[12.5px]">
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
                {TRANSFER_CHANNELS.map((c) => {
                  const Icon = CHANNEL_ICONS[c.id];
                  const active = channelId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChannelId(c.id)}
                      className={`px-3.5 py-3.5 text-left rounded-2xl border cursor-pointer transition-colors ${
                        active ? "border-navy-lt bg-[#EAF1F9] shadow-[inset_0_0_0_1px_var(--color-navy-lt)]" : "border-border-lt bg-white hover:border-navy-lt/50"
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl mb-2 ${active ? "bg-white text-navy" : "bg-tint text-ink-2"}`}>
                        <Icon size={16} />
                      </span>
                      <strong className={`block text-[13px] font-bold ${active ? "text-navy" : "text-ink"}`}>{c.label}</strong>
                      <span className="block mt-0.5 text-[10.5px] text-ink-2">{c.sub}</span>
                    </button>
                  );
                })}
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
                <span className="inline-flex items-center justify-center gap-1.5">
                  Proceed to Review &amp; Authorization <ArrowRight size={13} />
                </span>
              </Btn>
            </WizActions>
          </div>
        ) : null}

        {stage === 2 && beneficiary && quote ? (
          <div className="p-4.5 sm:p-5">
            <div className="rounded-2xl border border-border-lt bg-[#EAF1F9] px-4.5 py-4 mb-4">
              <h3 className="m-0 text-[13.5px] font-bold text-navy">Review Transaction Details</h3>
              <p className="m-0 mt-1.5 text-[12.5px] text-ink">Please verify the beneficiary account and transfer mode before final submission.</p>
            </div>

            <div className="rounded-2xl border border-border-lt bg-white px-4.5 py-4 mb-4">
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
            </div>

            <div className="flex items-center justify-between gap-3.5 flex-wrap rounded-2xl border border-border-lt bg-tint px-4.5 py-4">
              <div>
                <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Total amount to debit</span>
                <div className="font-num tabular-nums text-[24px] font-bold text-navy mt-0.5">{displayMoney(quote.debit, "INR", balancesHidden)}</div>
                <span className="text-[11px] text-ink-2">{amountInWordsInr(quote.debit)} Only</span>
              </div>
              <Tag variant="processing">{channel.clearing}</Tag>
            </div>

            <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 py-4 mt-4.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-[13.5px] font-bold text-navy m-0 flex items-center gap-1.5">
                  <KeyRound size={15} className="text-amber" /> Enter 9-Digit Transaction Security PIN
                </h3>
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
                className="w-full mt-2.5 text-[13px] px-2.5 py-2 border border-border rounded-lg bg-white focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
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
              <Btn onClick={() => setStage(1)} disabled={submitting}>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeft size={13} /> Back to Edit
                </span>
              </Btn>
              <Btn variant="approve" disabled={pin.length !== 9 || submitting} onClick={() => void authorize()}>
                {submitting ? "Authorizing…" : `Authorize & Transfer ${formatCode(quote.debit, "INR")}`}
              </Btn>
            </WizActions>
          </div>
        ) : null}

        {stage === 3 && receipt ? (
          <TransferReceiptPanel
            receipt={receipt}
            balancesHidden={balancesHidden}
            onOpenVoucher={() => setVoucherOpen(true)}
            onReset={resetAll}
          />
        ) : null}
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm px-4.5 sm:px-5 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Policy Flow Mapping</h3>
          <span className="text-[11px] text-ink-2">11 steps</span>
        </div>
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
      </div>

      {voucherOpen && receipt ? (
        <TransferVoucherModal
          receipt={receipt}
          accountNumber={store.user.accountNumber}
          ifsc={store.user.ifsc}
          micr={store.user.micr}
          balancesHidden={balancesHidden}
          onClose={() => setVoucherOpen(false)}
        />
      ) : null}
    </>
  );
}
