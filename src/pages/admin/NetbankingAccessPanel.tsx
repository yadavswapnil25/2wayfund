import { useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { updateNetbankingAccess } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";

/** The Compliance Console's "Netbanking Access" control, shown inside a
 * customer's expanded row in Customer Accounts. Switches Transfer Funds
 * / Currency Exchange on or off for this account entirely — independent
 * of the Freeze Account control (TransferBlockPanel): login and every
 * other account action are unaffected either way, only transacting is
 * gated. No reason is recorded — unlike a freeze, this isn't a
 * risk/fraud action, it's whether the service is switched on at all. */
export function NetbankingAccessPanel({
  userId,
  token,
  enabled: initialEnabled,
  onChange,
}: {
  userId: number;
  token: string;
  enabled: boolean;
  onChange?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await updateNetbankingAccess(userId, !enabled, token);
      setEnabled(result);
      onChange?.(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update netbanking access. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {enabled ? <Wifi size={13} className="text-navy" /> : <WifiOff size={13} className="text-neg" />}
          <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Netbanking Access</h4>
          <Tag variant={enabled ? "approved" : "rejected"} className="ml-1">
            {enabled ? "Enabled" : "Disabled"}
          </Tag>
        </div>
        <Btn type="button" variant={enabled ? "reject" : "approve"} onClick={() => void toggle()} disabled={submitting}>
          {submitting ? "Updating…" : enabled ? "Disable Netbanking" : "Enable Netbanking"}
        </Btn>
      </div>
      <p className="m-0 mt-2 text-[11px] text-ink-2">
        {enabled
          ? "This customer can use Transfer Funds and Currency Exchange."
          : "Transfer Funds and Currency Exchange are switched off for this account — login and everything else still works."}
      </p>

      {error ? (
        <Callout title="Couldn't update netbanking access" variant="warn" className="mt-3">
          <p>{error}</p>
        </Callout>
      ) : null}
    </div>
  );
}
