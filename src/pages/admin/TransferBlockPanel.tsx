import { useState, type FormEvent } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { updateCustomerTransferBlock, type TransferBlockScope, type TransferBlockStatus } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";

const SCOPE_OPTIONS: { value: TransferBlockScope; label: string; hint: string }[] = [
  { value: "external_only", label: "Allow internal transfers", hint: "Blocks external transfers only — 2 Way Fund internal transfers still go through." },
  { value: "all", label: "Block all transfers", hint: "Blocks every transfer, internal and external. Currency exchange still works." },
  { value: "everything", label: "Block all debit & credit transactions", hint: "Blocks every transfer and currency exchange — nothing moves in or out. Staff can still credit the account to correct it." },
];

const SCOPE_TAG_LABEL: Record<TransferBlockScope, string> = {
  external_only: "Frozen — external only",
  all: "Frozen — all transfers",
  everything: "Frozen — everything",
};

/** The Compliance Console's "Freeze Account" control, shown inside a
 * customer's expanded row in Customer Accounts. Instantly freezes or
 * unfreezes the customer's own financial actions at one of three scopes
 * — a targeted risk/fraud control, not a full account lock, so login,
 * beneficiaries, and cards are always unaffected regardless of scope.
 * "everything" also stops Currency Exchange, but never a staff-initiated
 * credit (Add Funds) — a freeze restricts the customer, not the staff
 * correcting their account. */
export function TransferBlockPanel({
  userId,
  token,
  blocked: initialBlocked,
  reason: initialReason,
  scope: initialScope,
  onChange,
}: {
  userId: number;
  token: string;
  blocked: boolean;
  reason: string | null;
  scope: TransferBlockScope | null;
  onChange?: (status: TransferBlockStatus) => void;
}) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [reason, setReason] = useState(initialReason ?? "");
  const [scope, setScope] = useState<TransferBlockScope>(initialScope ?? "all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const nextBlocked = !blocked;
      const result = await updateCustomerTransferBlock(
        userId,
        { blocked: nextBlocked, reason: reason.trim() || undefined, scope: nextBlocked ? scope : undefined },
        token
      );
      setBlocked(result.blocked);
      setReason(result.reason ?? "");
      setScope(result.scope ?? "all");
      onChange?.(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update the account freeze. Please try again.");
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
          {blocked ? SCOPE_TAG_LABEL[scope] : "Active"}
        </Tag>
      </div>

      {error ? (
        <Callout title="Couldn't update the account freeze" variant="warn" className="mb-3">
          <p>{error}</p>
        </Callout>
      ) : null}

      <form onSubmit={submit} className="flex flex-col gap-2.5">
        {!blocked ? (
          <div className="flex gap-3 flex-wrap">
            {SCOPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-start gap-1.5 text-[12px] text-ink max-w-[260px] cursor-pointer">
                <input
                  type="radio"
                  name={`freeze-scope-${userId}`}
                  className="mt-0.5"
                  checked={scope === opt.value}
                  onChange={() => setScope(opt.value)}
                />
                <span>
                  <span className="block font-semibold">{opt.label}</span>
                  <span className="block text-[10.5px] text-ink-2">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
        ) : null}

        <div className="flex items-end gap-2.5 flex-wrap">
          <Field label={blocked ? "Freeze reason (on file)" : "Reason (required to freeze)"} htmlFor={`block-reason-${userId}`} className="mb-0 flex-1 min-w-[220px]">
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
            {submitting ? "Updating…" : blocked ? "Unfreeze Account" : "Freeze Account"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
