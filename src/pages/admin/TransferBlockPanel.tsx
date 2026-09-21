import { useState, type FormEvent } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { updateCustomerTransferBlock, type TransferBlockScope, type TransferBlockStatus } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";

const SCOPE_OPTIONS: { value: TransferBlockScope; label: string; hint: string }[] = [
  { value: "external_only", label: "Allow internal transfers", hint: "Blocks external transfers only — 2 Way Fund internal transfers still go through." },
  { value: "internal_only", label: "Allow external transactions", hint: "Blocks internal 2 Way Fund transfers only — external transfers to Indian commercial banks still go through." },
  { value: "all", label: "Block all transfers", hint: "Blocks every transfer, internal and external. Currency exchange still works." },
  { value: "everything", label: "Block all debit & credit transactions", hint: "Blocks every transfer and currency exchange — nothing moves in or out. Staff can still credit the account to correct it." },
];

const SCOPE_TAG_LABEL: Record<TransferBlockScope, string> = {
  external_only: "Frozen — external only",
  internal_only: "Frozen — internal only",
  all: "Frozen — all transfers",
  everything: "Frozen — everything",
};

/** The Compliance Console's "Transfer Funds Access" scope picker, shown
 * inside a customer's expanded row in Customer Accounts, right above the
 * Account Freeze control. This panel only ever saves which scope will
 * apply the next time the account is frozen — it can't freeze or
 * unfreeze anything itself; AccountFreezePanel below it does that,
 * reusing whatever scope was last saved here (or TransferBlockScope::All
 * if none ever was). */
export function TransferBlockPanel({
  userId,
  token,
  blocked,
  scope: initialScope,
  onChange,
}: {
  userId: number;
  token: string;
  blocked: boolean;
  scope: TransferBlockScope | null;
  onChange?: (status: TransferBlockStatus) => void;
}) {
  const [scope, setScope] = useState<TransferBlockScope | null>(initialScope);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveScope(e: FormEvent) {
    e.preventDefault();
    if (scope === null || savingPrefs) return;
    setError(null);
    setSavingPrefs(true);
    try {
      const result = await updateCustomerTransferBlock(userId, { blocked, scope }, token);
      setScope(result.scope);
      onChange?.(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save these preferences. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        {blocked ? <ShieldAlert size={13} className="text-neg" /> : <ShieldCheck size={13} className="text-navy" />}
        <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Transfer Funds Access</h4>
        <Tag variant={blocked ? "rejected" : "approved"} className="ml-1">
          {blocked ? (scope ? SCOPE_TAG_LABEL[scope] : "Frozen") : "Active"}
        </Tag>
      </div>

      {error ? (
        <Callout title="Couldn't save these preferences" variant="warn" className="mb-3">
          <p>{error}</p>
        </Callout>
      ) : null}

      <form onSubmit={saveScope} className="flex flex-col gap-2.5">
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

        <div>
          <Btn type="submit" disabled={savingPrefs || scope === null}>
            {savingPrefs ? "Saving…" : "Update"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
