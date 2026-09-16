import { useState, type FormEvent } from "react";
import { Gauge } from "lucide-react";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { formatCode } from "../../lib/format";
import { updateAccountLimit } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";

/** The Compliance Console's "Transaction Limit" control, shown inside a
 * customer's expanded row in Customer Accounts. Sets the daily domestic
 * transfer cap directly, overriding whatever the account tier assigned
 * at provisioning (App\Support\TierCatalog only sets the *starting*
 * value). Actually enforced against the day's Transfer Funds activity —
 * see TransferService::assertWithinDailyLimit — not just a displayed
 * number. A limit of 0 is valid and deliberately blocks every transfer,
 * a narrower alternative to Freeze Account. */
export function AccountLimitPanel({
  userId,
  token,
  limit: initialLimit,
  onChange,
}: {
  userId: number;
  token: string;
  limit: number;
  onChange?: (limit: number) => void;
}) {
  const [limit, setLimit] = useState(initialLimit);
  const [input, setInput] = useState(String(initialLimit));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const numeric = Number(input);
    if (input.trim() === "" || Number.isNaN(numeric) || numeric < 0) {
      setError("Enter a limit of zero or more.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateAccountLimit(userId, numeric, token);
      setLimit(result);
      setInput(String(result));
      setSaved(true);
      onChange?.(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update the transaction limit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Gauge size={13} className="text-navy" />
        <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Transaction Limit</h4>
      </div>
      <p className="m-0 mb-3 text-[11.5px] text-ink-2">
        Current daily domestic transfer limit: <strong className="text-ink">{formatCode(limit, "INR")}</strong>
        {limit === 0 ? " — every transfer is currently blocked." : ""}
      </p>

      {saved ? (
        <Callout title="Limit updated" className="mb-3">
          <p>The new daily transfer limit applies from now on, including transfers already made today.</p>
        </Callout>
      ) : null}
      {error ? (
        <Callout title="Couldn't update the limit" variant="warn" className="mb-3">
          <p>{error}</p>
        </Callout>
      ) : null}

      <form onSubmit={submit} className="flex items-end gap-2.5 flex-wrap">
        <Field label="Daily limit (INR)" htmlFor={`limit-amount-${userId}`} className="mb-0">
          <div className="w-[160px]">
            <TextInput
              id={`limit-amount-${userId}`}
              type="number"
              min="0"
              step="0.01"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setSaved(false);
              }}
            />
          </div>
        </Field>
        <Btn type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save Limit"}
        </Btn>
      </form>
    </div>
  );
}
