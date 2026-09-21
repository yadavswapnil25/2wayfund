import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { updateCustomerTransferBlock, type TransferBlockStatus } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";

/** The Compliance Console's "Freeze Account" control, shown inside a
 * customer's expanded row in Customer Accounts, right below the
 * "Transfer Funds Access" scope picker. That panel only ever saves a
 * scope preference — it can't freeze or unfreeze anything by itself.
 * This is the actual trigger: flips transfers_blocked on or off, reusing
 * whatever scope was last saved there (or TransferBlockScope::All if
 * none ever was, per the backend's own fallback). Login and every other
 * account action are unaffected either way — only Transfer Funds and
 * Currency Exchange are gated. */
export function AccountFreezePanel({
  userId,
  token,
  blocked: initialBlocked,
  onChange,
}: {
  userId: number;
  token: string;
  blocked: boolean;
  onChange?: (status: TransferBlockStatus) => void;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await updateCustomerTransferBlock(userId, { blocked: !blocked }, token);
      setBlocked(result.blocked);
      onChange?.(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update the account freeze. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {blocked ? <ShieldAlert size={13} className="text-neg" /> : <ShieldCheck size={13} className="text-navy" />}
          <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Account Freeze</h4>
          <Tag variant={blocked ? "rejected" : "approved"} className="ml-1">
            {blocked ? "Frozen" : "Active"}
          </Tag>
        </div>
        <Btn type="button" variant={blocked ? "approve" : "reject"} onClick={() => void toggle()} disabled={submitting}>
          {submitting ? "Updating…" : blocked ? "Unfreeze Account" : "Freeze Account"}
        </Btn>
      </div>
      <p className="m-0 mt-2 text-[11px] text-ink-2">
        {blocked
          ? "Transfer Funds and Currency Exchange are switched off for this account — login and everything else still works."
          : "This customer can use Transfer Funds and Currency Exchange, at the scope saved above."}
      </p>

      {error ? (
        <Callout title="Couldn't update the account freeze" variant="warn" className="mt-3">
          <p>{error}</p>
        </Callout>
      ) : null}
    </div>
  );
}
