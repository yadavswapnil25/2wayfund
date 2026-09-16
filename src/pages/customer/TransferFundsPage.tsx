import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Btn } from "../../components/ui/Button";
import { DetailGrid, LoadingBlock, Note } from "../../components/ui/Misc";
import { Stepper, WizActions } from "../../components/ui/Stepper";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { beneCodeLabel, beneficiaryRestrictionReason, transferBlockMessage, transferChannel, txQuote } from "../../lib/transfer";
import { displayMoney, formatCode } from "../../lib/format";
import { amountInWordsInr } from "../../lib/words";
import { getMe, getBalances } from "../../services/meService";
import { listBeneficiaries } from "../../services/beneficiaryService";
import {
  getTransferSession,
  initiateTransfer,
  resendTransferEmailOtp,
  resendTransferIdentityOtp,
  selectTransferPin,
  verifyTransferEmailOtp,
  verifyTransferIdentityOtp,
  verifyTransferPin,
  type TransferChannel,
  type TransferSession,
} from "../../services/transferService";
import { ApiError } from "../../services/apiClient";
import { TransferDetailsForm } from "./TransferDetailsForm";
import { AuthProgress, TransferOtpStep, TransferPinGridStep, TransferPinStep, TransferTerminalNotice } from "./TransferAuthViews";
import { TransferReceiptPanel, TransferVoucherModal, type TransferReceiptView } from "./TransferReceiptViews";
import { TransferProcessingPanel } from "./TransferProcessingView";
import type { Balance, Beneficiary } from "../../types/data";

// Floor on how long the processing screen stays up, so it always reads as
// genuine work rather than a flash — even when the API responds instantly
// on a local/low-latency connection.
const MIN_PROCESSING_MS = 2200;

type Stage = "details" | "review" | "auth" | "receipt";
const STAGE_INDEX: Record<Stage, number> = { details: 1, review: 2, auth: 3, receipt: 4 };

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
  const { store, setStore, session: auth, balancesHidden } = useApp();
  const [stage, setStage] = useState<Stage>("details");
  const [beneId, setBeneId] = useState("");
  const [channelId, setChannelId] = useState<TransferChannel>("IMPS");
  const [amountRaw, setAmountRaw] = useState("");
  const [remarks, setRemarks] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [transfer, setTransfer] = useState<TransferSession | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [receipt, setReceipt] = useState<TransferReceiptView | null>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  // Never renders seed beneficiaries/balances on the Details stage —
  // nothing shows there until the real ones actually come back, success
  // or failure. The shared store is only fresh once some other page has
  // loaded it, and a customer can land here first, so this page fetches
  // its own copies rather than trusting it's current.
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshMe = useCallback(
    (signal?: AbortSignal) => {
      if (!auth.token) return Promise.resolve();
      return getMe(auth.token, signal)
        .then((me) => setStore((s) => ({ ...s, user: { ...s.user, ...me } })))
        .catch(() => undefined);
    },
    [auth.token, setStore]
  );

  useEffect(() => {
    const controller = new AbortController();
    const token = auth.token;
    if (!token) {
      setLoadError("Your session has no API token — sign out and sign back in.");
      return;
    }

    void Promise.all([getBalances(token, controller.signal), listBeneficiaries(token, controller.signal)])
      .then(([realBalances, realBeneficiaries]) => {
        setBalances(realBalances);
        setBeneficiaries(realBeneficiaries);
        // A payee picked from the seed list before the real one arrived
        // would otherwise linger as a dangling id and silently blank the
        // review stage.
        setBeneId((id) => (realBeneficiaries.some((b) => b.id === id) ? id : ""));
        setLoadError(null);
        setLoaded(true);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load your account details. Please try again.");
      });
    void refreshMe(controller.signal);

    return () => controller.abort();
  }, [auth.token, refreshMe]);

  const beneficiary = beneficiaries.find((b) => b.id === beneId) || null;
  const amount = parseAmount(amountRaw);
  const channel = transferChannel(channelId);
  const inrLedger = balances.find((b) => b.currency === "INR") ?? { currency: "INR" as const, amount: 0, note: "" };
  const quote = beneficiary ? txQuote(store, amount, beneficiary) : null;
  const blockMessage = transferBlockMessage(store.user, beneficiary);

  function resetAll() {
    setStage("details");
    setBeneId("");
    setChannelId("IMPS");
    setAmountRaw("");
    setRemarks("");
    setAmountError(null);
    setReviewError(null);
    setTransfer(null);
    setAuthError(null);
    setReceipt(null);
  }

  function goToReview() {
    const problem = blockMessage
      ? blockMessage
      : !beneficiary
        ? "Select a beneficiary to continue."
        : beneficiary.status !== "Verified"
          ? `${beneficiary.name} is within its post-registration cooling-off period and cannot receive a transfer yet.`
          : !(amount > 0)
            ? "Enter an amount greater than zero."
            : channel.minAmount && amount < channel.minAmount
              ? `RTGS requires a minimum of ${formatCode(channel.minAmount, "INR")}.`
              : amount > inrLedger.amount
                ? `Amount exceeds the available balance in the INR ledger (${formatCode(inrLedger.amount, "INR")}).`
                : beneficiaryRestrictionReason(beneficiary);
    setAmountError(problem);
    if (problem) return;
    setReviewError(null);
    setStage("review");
  }

  async function startAuthorisation() {
    if (!beneficiary || !auth.token || busy) return;
    setBusy(true);
    setReviewError(null);
    try {
      const created = await initiateTransfer({ beneficiaryId: beneficiary.id, channel: channelId, amount, remarks: remarks.trim() || undefined }, auth.token);
      setTransfer(created);
      setAuthError(null);
      setStage("auth");
    } catch (err) {
      setReviewError(firstErrorMessage(err, "Could not start this transfer. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  /** Runs one authorisation step; on a rejection, re-syncs the session so
   * attempts-remaining, a reshuffled grid, or a cancelled/frozen outcome
   * all show without a page reload. */
  async function runStep(action: (token: string, id: number) => Promise<TransferSession>) {
    if (!transfer || !auth.token || busy) return;
    const token = auth.token;
    setBusy(true);
    setAuthError(null);
    try {
      setTransfer(await action(token, transfer.id));
    } catch (err) {
      setAuthError(firstErrorMessage(err, "Could not verify that. Please try again."));
      const fresh = await getTransferSession(transfer.id, token).catch(() => null);
      if (fresh) setTransfer(fresh);
      if (fresh?.stage === "frozen") void refreshMe();
    } finally {
      setBusy(false);
    }
  }

  async function submitIdentityOtp(otp: string) {
    if (!transfer || !auth.token || !quote || busy) return;
    const token = auth.token;
    setBusy(true);
    setAuthError(null);
    setProcessing(true);
    try {
      const [result] = await Promise.all([
        verifyTransferIdentityOtp(transfer.id, otp, token),
        new Promise((resolve) => setTimeout(resolve, MIN_PROCESSING_MS)),
      ]);
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
      setStage("receipt");
    } catch (err) {
      setAuthError(firstErrorMessage(err, "Could not complete this transfer. Please try again."));
      const fresh = await getTransferSession(transfer.id, token).catch(() => null);
      if (fresh) setTransfer(fresh);
    } finally {
      setProcessing(false);
      setBusy(false);
    }
  }

  function renderAuthStep(t: TransferSession) {
    if (!t.active) return <TransferTerminalNotice session={t} onRestart={resetAll} />;
    const stepProps = { session: t, busy, error: authError };
    return (
      <div className="p-4.5 sm:p-5">
        <AuthProgress stage={t.stage} />
        {t.stage === "pin" ? <TransferPinStep {...stepProps} onSubmit={(pin) => void runStep((tok, id) => verifyTransferPin(id, pin, tok))} /> : null}
        {t.stage === "email_otp" ? (
          <TransferOtpStep
            {...stepProps}
            purpose="email"
            onSubmit={(otp) => void runStep((tok, id) => verifyTransferEmailOtp(id, otp, tok))}
            onResend={() => void runStep((tok, id) => resendTransferEmailOtp(id, tok))}
          />
        ) : null}
        {t.stage === "grid" ? <TransferPinGridStep {...stepProps} onSelect={(index) => void runStep((tok, id) => selectTransferPin(id, index, tok))} /> : null}
        {t.stage === "identity_otp" ? (
          <TransferOtpStep
            {...stepProps}
            purpose="identity"
            onSubmit={(otp) => void submitIdentityOtp(otp)}
            onResend={() => void runStep((tok, id) => resendTransferIdentityOtp(id, tok))}
          />
        ) : null}
        <p className="m-0 mt-4 text-[11px] text-ink-2">
          Sending {formatCode(t.amount, "INR")} to {t.beneficiaryName} via {t.channel}. Nothing moves until every step is complete.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title="Electronic Fund Transfer"
        lede="Transfer to Indian Commercial Banks (IMPS / NEFT / RTGS) or internal 2 Way Fund accounts. Authorised in four steps: your 9-digit PIN, an emailed code, recognising your PIN, and a final identity code."
      />

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <Stepper
          current={STAGE_INDEX[stage]}
          steps={[
            { label: "Details", sub: "Policy steps 3–4" },
            { label: "Review", sub: "Policy step 5" },
            { label: "Authorise", sub: "Policy steps 6–8" },
            { label: "Receipt", sub: "Policy steps 9–11" },
          ]}
        />

        {stage === "details" && !loaded ? (
          loadError ? (
            <div className="p-4.5 sm:p-5">
              <Note danger>{loadError}</Note>
            </div>
          ) : (
            <LoadingBlock label="Loading your accounts…" />
          )
        ) : null}

        {stage === "details" && loaded ? (
          <TransferDetailsForm
            beneficiaries={beneficiaries}
            beneficiary={beneficiary}
            beneId={beneId}
            channelId={channelId}
            amountRaw={amountRaw}
            remarks={remarks}
            amountError={amountError}
            accountNumber={store.user.accountNumber}
            availableInr={inrLedger.amount}
            balancesHidden={balancesHidden}
            blockMessage={blockMessage}
            onBeneChange={setBeneId}
            onChannelChange={setChannelId}
            onAmountChange={setAmountRaw}
            onRemarksChange={setRemarks}
            onProceed={goToReview}
          />
        ) : null}

        {stage === "review" && beneficiary && quote ? (
          <div className="p-4.5 sm:p-5">
            <div className="rounded-2xl border border-border-lt bg-[#EAF1F9] px-4.5 py-4 mb-4">
              <h3 className="m-0 text-[13.5px] font-bold text-navy">Review Transaction Details</h3>
              <p className="m-0 mt-1.5 text-[12.5px] text-ink">Please verify the beneficiary account and transfer mode before authorising.</p>
            </div>
            {reviewError ? (
              <Note danger className="mb-4">
                {reviewError}
              </Note>
            ) : null}
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
            <WizActions>
              <Btn onClick={() => setStage("details")} disabled={busy}>
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeft size={13} /> Back to Edit
                </span>
              </Btn>
              <Btn variant="approve" disabled={busy} onClick={() => void startAuthorisation()}>
                <span className="inline-flex items-center gap-1.5">
                  {busy ? "Starting…" : `Authorise ${formatCode(quote.debit, "INR")}`} <ArrowRight size={13} />
                </span>
              </Btn>
            </WizActions>
          </div>
        ) : null}

        {stage === "auth" && transfer && processing ? <TransferProcessingPanel steps={store.txFlow.slice(7)} /> : null}
        {stage === "auth" && transfer && !processing ? renderAuthStep(transfer) : null}

        {stage === "receipt" && receipt ? (
          <TransferReceiptPanel receipt={receipt} balancesHidden={balancesHidden} onOpenVoucher={() => setVoucherOpen(true)} onReset={resetAll} />
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
          Steps 1–2 are satisfied by the login you completed to reach this page. Steps 3–4 (select beneficiary, enter transaction) are the Details
          stage; step 5 (verify amount) is Review. Steps 6–8 (transaction PIN, emailed code, PIN recognition and a final identity code) are the
          Authorise stage. Steps 9–11 (processing through reference number) are the Receipt stage. The full control model is documented under
          Security &amp; KYC.
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
