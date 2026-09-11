import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Wallet } from "lucide-react";
import { Field, Select, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { creditCustomerAccount, listCustomerBalances, type CustomerBalance } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import { formatCode } from "../../lib/format";
import type { CurrencyCode } from "../../types/data";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "INR", "GBP", "CAD", "JPY", "AUD", "SGD", "CHF"];

/** The Compliance Console's "Add Funds" action, shown inside a customer's
 * expanded row in Customer Accounts. Credits the chosen currency's
 * balance directly — creating that currency's ledger row if the account
 * has never held one — and posts a matching "Admin credit" transaction,
 * so the credit shows up in the customer's own Recent Activity too.
 *
 * Shows the account's existing balances and defaults the currency picker
 * to match one of them: crediting a currency independent of what the
 * account actually holds silently creates an unrelated second balance
 * (e.g. Open Account defaults its opening deposit to USD; picking INR
 * here out of habit looks like "adding funds" but really opens a whole
 * new, empty INR ledger instead of topping up the USD one). */
export function AddFundsPanel({ userId, token }: { userId: number; token: string }) {
  const [balances, setBalances] = useState<CustomerBalance[] | null>(null);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credited, setCredited] = useState<{ currency: CurrencyCode; newBalance: number } | null>(null);

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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCredited(null);

    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await creditCustomerAccount(userId, { currency: effectiveCurrency, amount: numeric, note: note.trim() || undefined }, token);
      setCredited(result);
      setAmount("");
      setNote("");
      void loadBalances();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add funds. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Wallet size={13} className="text-navy" />
        <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Add Funds</h4>
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

      {credited ? (
        <Callout title="Funds credited" className="mb-3">
          <p>
            New {credited.currency} balance: <strong>{formatCode(credited.newBalance, credited.currency)}</strong>
          </p>
        </Callout>
      ) : null}
      {error ? (
        <Callout title="Couldn't add funds" variant="warn" className="mb-3">
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
        <Field label="Note (optional)" htmlFor={`fund-note-${userId}`} className="mb-0 flex-1 min-w-[180px]">
          <TextInput id={`fund-note-${userId}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Goodwill credit" />
        </Field>
        <Btn type="submit" variant="primary" disabled={submitting || balances === null}>
          {submitting ? "Adding…" : balances === null ? "Loading…" : "Add Funds"}
        </Btn>
      </form>
    </div>
  );
}
