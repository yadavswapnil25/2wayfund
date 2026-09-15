import { useState, type FormEvent } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { updateCustomerTransferBlock, type TransferBlockStatus } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";

/** The Compliance Console's "Block Transfers" control, shown inside a
 * customer's expanded row in Customer Accounts. Instantly blocks or
 * unblocks Transfer Funds for this account — a targeted risk/fraud
 * control, not a full account freeze, so every other customer action
 * (login, beneficiaries, currency exchange, cards) is unaffected. */
export function TransferBlockPanel({
  userId,
  token,
  blocked: initialBlocked,
  reason: initialReason,
  onChange,
}: {
  userId: number;
  token: string;
  blocked: boolean;
  reason: string | null;
  onChange?: (status: TransferBlockStatus) => void;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [reason, setReason] = useState(initialReason ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await updateCustomerTransferBlock(userId, { blocked: !blocked, reason: reason.trim() || undefined }, token);
      setBlocked(result.blocked);
      setReason(result.reason ?? "");
      onChange?.(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update the transfer block. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center gap-1.5 mb-2.5">
        {blocked ? <ShieldAlert size={13} className="text-neg" /> : <ShieldCheck size={13} className="text-navy" />}
        <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Transfer Funds Access</h4>
        <Tag variant={blocked ? "rejected" : "approved"} className="ml-1">
          {blocked ? "Blocked" : "Active"}
        </Tag>
      </div>

      {error ? (
        <Callout title="Couldn't update the transfer block" variant="warn" className="mb-3">
          <p>{error}</p>
        </Callout>
      ) : null}

      <form onSubmit={submit} className="flex items-end gap-2.5 flex-wrap">
        <Field label={blocked ? "Blocked reason (on file)" : "Reason (required to block)"} htmlFor={`block-reason-${userId}`} className="mb-0 flex-1 min-w-[220px]">
          <TextInput
            id={`block-reason-${userId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Suspected fraud, customer request"
            disabled={blocked}
            className={blocked ? "bg-tint" : undefined}
          />
        </Field>
        <Btn type="submit" variant={blocked ? "approve" : "reject"} disabled={submitting || (!blocked && !reason.trim())}>
          {submitting ? "Updating…" : blocked ? "Unblock Transfers" : "Block Transfers"}
        </Btn>
      </form>
    </div>
  );
}
