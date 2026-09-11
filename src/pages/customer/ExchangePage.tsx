import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, Select, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { formatCode } from "../../lib/format";
import { getBalances } from "../../services/meService";
import { confirmExchange, initiateExchange, type ExchangeConfirmation, type ExchangeQuote } from "../../services/exchangeService";
import { ApiError } from "../../services/apiClient";
import type { Balance, CurrencyCode } from "../../types/data";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "INR", "GBP", "CAD", "JPY", "AUD", "SGD", "CHF"];

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches RegisterAccountPage,
 * AdminLoginPage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

type Stage = "quote" | "otp" | "done";

/** Converts one of the customer's own currency balances into another —
 * e.g. a foreign-currency credit into their INR "main" balance. Two-step
 * like self-service registration: a quote is emailed as a one-time code
 * first, and nothing moves until that code is entered back here. */
export function ExchangePage() {
  const { store, session } = useApp();
  const [stage, setStage] = useState<Stage>("quote");

  const [balances, setBalances] = useState<Balance[]>(store.balances);
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(store.balances[0]?.currency ?? "USD");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("INR");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");

  const [quote, setQuote] = useState<ExchangeQuote | null>(null);
  const [result, setResult] = useState<ExchangeConfirmation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Seed data renders immediately, then is quietly replaced by the real
  // balances once the backend responds — the shared store's own balances
  // are only ever fresh once the Account & Passbook page has loaded, and
  // a customer can easily land here first (e.g. from a bookmark, or
  // straight after login on some other page), so this page fetches its
  // own copy rather than trusting the store might already be current.
  const loadBalances = useCallback(async (signal?: AbortSignal) => {
    if (!session.token) return;
    try {
      const real = await getBalances(session.token, signal);
      setBalances(real);
    } catch {
      if (signal?.aborted) return;
      // Best-effort — the seed/last-known balances stay displayed, and
      // the real backend re-validates the amount at confirm time anyway.
    }
  }, [session.token]);

  useEffect(() => {
    const controller = new AbortController();
    void loadBalances(controller.signal);
    return () => controller.abort();
  }, [loadBalances]);

  const fromBalance = balances.find((b) => b.currency === fromCurrency);

  async function submitQuote() {
    if (submitting) return;
    setError(null);

    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (fromCurrency === toCurrency) {
      setError("Choose two different currencies.");
      return;
    }
    if (!session.token) {
      setError("Your session has no API token — sign out and sign back in.");
      return;
    }

    setSubmitting(true);
    try {
      const q = await initiateExchange({ fromCurrency, toCurrency, amount: numeric }, session.token);
      setQuote(q);
      setStage("otp");
    } catch (err) {
      setError(firstErrorMessage(err, "Could not start this exchange. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOtp() {
    if (submitting || !quote || !session.token) return;
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const confirmation = await confirmExchange({ ref: quote.ref, otp }, session.token);
      setResult(confirmation);
      setStage("done");
      void loadBalances();
    } catch (err) {
      setError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setStage("quote");
    setQuote(null);
    setResult(null);
    setOtp("");
    setAmount("");
    setError(null);
  }

  return (
    <>
      <PageHead
        title="Currency Exchange"
        lede="Convert one of your own currency balances into another — e.g. a foreign-currency credit into your INR main balance. Illustrative rates, not live market data."
      />

      <div className="max-w-[480px]">
        <Panel>
          <PanelBody>
            {error ? (
              <Note danger className="mb-3.5">
                {error}
              </Note>
            ) : null}

            {stage === "quote" ? (
              <>
                <Field
                  label="Convert from"
                  htmlFor="fx-amount"
                  className="mb-3.5"
                  hint={fromBalance ? `Available: ${formatCode(fromBalance.amount, fromBalance.currency)}` : "No balance in this currency yet."}
                >
                  <div className="flex gap-1.5">
                    <div className="w-[96px] flex-none">
                      <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}>
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex-1 min-w-0">
                      <TextInput
                        id="fx-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </Field>

                <Field label="Convert to" htmlFor="fx-to" className="mb-4">
                  <div className="w-[96px]">
                    <Select id="fx-to" value={toCurrency} onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}>
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                </Field>

                <Btn variant="block" onClick={() => void submitQuote()} disabled={submitting}>
                  {submitting ? "Sending code…" : "Get Quote & Send Code"}
                </Btn>
              </>
            ) : null}

            {stage === "otp" && quote ? (
              <>
                <div className="rounded-lg border border-border-lt bg-tint px-3.5 py-3 mb-4">
                  <p className="m-0 text-[12px] text-ink-2">You're converting</p>
                  <p className="m-0 text-[15px] font-bold text-navy">
                    {formatCode(quote.fromAmount, quote.fromCurrency)} → {formatCode(quote.toAmount, quote.toCurrency)}
                  </p>
                  <p className="m-0 mt-1 text-[11px] text-ink-2">
                    Rate {quote.rate.toFixed(4)} · Commission {formatCode(quote.commission, quote.toCurrency)}
                  </p>
                </div>

                <Field label="One-Time Code" htmlFor="fx-otp" hint="6 digits, expires 10 minutes after it's sent." className="mb-4">
                  <TextInput
                    id="fx-otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="off"
                    onKeyDown={(e) => e.key === "Enter" && void submitOtp()}
                  />
                </Field>

                <Btn variant="block" onClick={() => void submitOtp()} disabled={submitting}>
                  {submitting ? "Confirming…" : "Confirm Exchange"}
                </Btn>

                <p className="mt-3 mb-0 text-center text-[12px]">
                  <button type="button" onClick={startOver} className="font-semibold text-ink-2 underline">
                    Start over
                  </button>
                </p>
              </>
            ) : null}

            {stage === "done" && result ? (
              <>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EFF8F2] text-pos mb-2">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="m-0 text-[15px] font-bold text-navy">Exchange completed</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg border border-border-lt px-3.5 py-3">
                    <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">New {result.fromBalance.currency} balance</span>
                    <p className="m-0 mt-0.5 font-num font-bold text-[14px] text-navy">
                      {formatCode(result.fromBalance.amount, result.fromBalance.currency)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-lt px-3.5 py-3">
                    <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">New {result.toBalance.currency} balance</span>
                    <p className="m-0 mt-0.5 font-num font-bold text-[14px] text-navy">
                      {formatCode(result.toBalance.amount, result.toBalance.currency)}
                    </p>
                  </div>
                </div>
                <Btn variant="block" onClick={startOver}>
                  Convert More
                </Btn>
              </>
            ) : null}
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
