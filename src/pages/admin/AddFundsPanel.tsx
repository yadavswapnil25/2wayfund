import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Wallet } from "lucide-react";
import { Field, Select, TextInput } from "../../components/ui/Field";
import { DatePicker } from "../../components/ui/DatePicker";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import {
  creditCustomerAccount,
  debitCustomerAccount,
  listCustomerBalances,
  type CustomerBalance,
} from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import { formatCode } from "../../lib/format";
import { todayIso } from "../../lib/dates";
import type { CurrencyCode } from "../../types/data";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "INR", "GBP", "CAD", "JPY", "AUD", "SGD", "CHF"];

type Direction = "credit" | "debit";

/** The Compliance Console's "Add / Debit Funds" action, shown inside a
 * customer's expanded row in Customer Accounts. Credits or debits the
 * chosen currency's balance directly — a credit creates that currency's
 * ledger row if the account has never held one; a debit is rejected
 * outright by the backend if it would take the balance negative — and
 * posts a matching "Admin credit"/"Admin debit" transaction, so it shows
 * up in the customer's own Recent Activity too.
 *
 * Shows the account's existing balances and defaults the currency picker
 * to match one of them: acting on a currency independent of what the
 * account actually holds either silently creates an unrelated second
 * balance (credit) or is simply impossible (debit) — e.g. Open Account
 * defaults its opening deposit to USD; picking INR here out of habit
 * doesn't mean "the account's funds," it means a different, unrelated
 * ledger.
 *
 * `fixedDirection` locks the panel to just Credit or just Debit and hides
 * the toggle — Add Funds and Debit Funds are now separate sidebar tools
 * rather than one combined control, so each only ever needs its own
 * direction. */
export function AddFundsPanel({ userId, token, fixedDirection }: { userId: number; token: string; fixedDirection?: Direction }) {
  const [direction, setDirection] = useState<Direction>(fixedDirection ?? "credit");
  const [balances, setBalances] = useState<CustomerBalance[] | null>(null);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [valueDate, setValueDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState<{ direction: Direction; currency: CurrencyCode; newBalance: number; valueDate: string } | null>(null);

  const loadBalances = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const result = await listCustomerBalances(userId, token, signal);
        setBalances(result);
        setBalancesError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setBalancesError(err instanceof ApiError ? err.message : "Could not load current balances.");
      }
    },
    [userId, token]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadBalances(controller.signal);
    return () => controller.abort();
  }, [loadBalances]);

  // Defaults to whatever currency the account already holds — only once
  // balances load, and only if the admin hasn't already picked one.
  const effectiveCurrency = currency ?? balances?.[0]?.currency ?? "INR";

  function switchDirection(next: Direction) {
    setDirection(next);
    setError(null);
    setPosted(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPosted(null);

    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    const effectiveValueDate = valueDate || todayIso();
    const action = direction === "credit" ? creditCustomerAccount : debitCustomerAccount;

    setSubmitting(true);
    try {
      const result = await action(
        userId,
        {
          currency: effectiveCurrency,
          amount: numeric,
          note: note.trim() || undefined,
          valueDate: effectiveValueDate !== todayIso() ? effectiveValueDate : undefined,
        },
        token
      );
      setPosted({ ...result, direction, valueDate: effectiveValueDate });
      setAmount("");
      setNote("");
      setValueDate(todayIso());
      void loadBalances();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Could not ${direction === "credit" ? "add" : "debit"} funds. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2.5">
        <div className="flex items-center gap-1.5">
          <Wallet size={13} className="text-navy" />
          <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">
            {fixedDirection ? (fixedDirection === "credit" ? "Add Funds" : "Debit Funds") : "Add / Debit Funds"}
          </h4>
        </div>
        {!fixedDirection ? (
          <div className="inline-flex rounded-full border border-border-lt bg-tint p-0.5">
            {(["credit", "debit"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => switchDirection(d)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  direction === d ? "bg-white text-navy shadow-sm" : "text-ink-2 hover:text-navy"
                }`}
              >
                {d === "credit" ? "Credit" : "Debit"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="m-0 mb-3 text-[11.5px] text-ink-2">
        Current balances:{" "}
        {balancesError ? (
          <span className="text-neg">{balancesError}</span>
        ) : balances === null ? (
          "Loading…"
        ) : balances.length === 0 ? (
          "none yet"
        ) : (
          <strong className="text-ink">{balances.map((b) => formatCode(b.amount, b.currency)).join(" · ")}</strong>
        )}
      </p>

      {posted ? (
        <Callout title={posted.direction === "credit" ? "Funds credited" : "Funds debited"} className="mb-3">
          <p>
            New {posted.currency} balance: <strong>{formatCode(posted.newBalance, posted.currency)}</strong>
            {posted.valueDate !== todayIso() ? (
              <>
                {" "}
                — posted with value date <strong>{posted.valueDate}</strong>
              </>
            ) : null}
          </p>
        </Callout>
      ) : null}
      {error ? (
        <Callout title={direction === "credit" ? "Couldn't add funds" : "Couldn't debit funds"} variant="warn" className="mb-3">
          <p>{error}</p>
        </Callout>
      ) : null}

      <form onSubmit={submit} className="flex items-end gap-2.5 flex-wrap">
        <Field label="Currency" htmlFor={`fund-currency-${userId}`} className="mb-0">
          <div className="w-[84px]">
            <Select
              id={`fund-currency-${userId}`}
              value={effectiveCurrency}
              disabled={balances === null}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        </Field>
        <Field label="Amount" htmlFor={`fund-amount-${userId}`} className="mb-0">
          <div className="w-[130px]">
            <TextInput
              id={`fund-amount-${userId}`}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </Field>
        <Field label="Value date" htmlFor={`fund-date-${userId}`} className="mb-0">
          <div className="w-[150px]">
            <DatePicker id={`fund-date-${userId}`} value={valueDate} onChange={setValueDate} max={todayIso()} />
          </div>
        </Field>
        <Field label="Note (optional)" htmlFor={`fund-note-${userId}`} className="mb-0 flex-1 min-w-[180px]">
          <TextInput
            id={`fund-note-${userId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={direction === "credit" ? "e.g. Goodwill credit" : "e.g. Reversing a credit issued in error"}
          />
        </Field>
        <Btn type="submit" variant={direction === "credit" ? "primary" : "reject"} disabled={submitting || balances === null}>
          {submitting
            ? direction === "credit"
              ? "Adding…"
              : "Debiting…"
            : balances === null
              ? "Loading…"
              : direction === "credit"
                ? "Add Funds"
                : "Debit Funds"}
        </Btn>
      </form>
    </div>
  );
}
