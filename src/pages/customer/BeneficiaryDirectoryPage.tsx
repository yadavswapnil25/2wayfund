import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Landmark, ShieldAlert, Users } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import type { Beneficiary } from "../../types/data";
import { completeBeneficiaryCheck, deleteBeneficiary, listBeneficiaries } from "../../services/beneficiaryService";

function beneCodeLabel(b: Beneficiary): string {
  if (b.ifsc && b.swift) return `IFSC ${b.ifsc} · SWIFT ${b.swift}`;
  if (b.ifsc) return `IFSC ${b.ifsc}`;
  if (b.swift) return `SWIFT ${b.swift}`;
  return b.internal ? "Internal — no routing code" : "No routing code on file";
}

function beneBadge(b: Beneficiary): { label: string; variant: string } {
  if (b.internal) return { label: "2WF Internal", variant: "processing" };
  if (b.country === "India") return { label: "Indian Bank", variant: "completed" };
  return { label: "International", variant: "review" };
}

export function BeneficiaryDirectoryPage() {
  const { store, session } = useApp();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(store.beneficiaries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) return;
      try {
        const list = await listBeneficiaries(session.token, signal);
        setBeneficiaries(list);
      } catch {
        // best-effort — the seeded list stays displayed on failure
      }
    },
    [session.token],
  );

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  async function completeCheck(id: string) {
    if (!session.token || busyId) return;
    setError(null);
    setBusyId(id);
    try {
      await completeBeneficiaryCheck(id, session.token);
      await refresh();
    } catch {
      setError("Could not complete the check for that beneficiary. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeBene(id: string) {
    if (!session.token || busyId) return;
    setError(null);
    setBusyId(id);
    try {
      await deleteBeneficiary(id, session.token);
      await refresh();
    } catch {
      setError("Could not remove that beneficiary. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHead
        title="Saved Beneficiaries Directory"
        lede="Payees authorised on your NetBanking profile. Only beneficiaries marked Verified can be selected on Transfer Funds."
      />

      <div className="max-w-[720px] flex flex-col gap-4">
        {error ? <Note danger>{error}</Note> : null}

        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <div className="flex items-center gap-3">
              <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
                <Users size={17} />
              </span>
              <div>
                <h3 className="m-0 text-[14.5px] font-bold text-navy">Saved Beneficiaries Directory</h3>
                <p className="m-0 mt-0.5 text-[11px] text-ink-2">Payees authorised on your NetBanking profile</p>
              </div>
            </div>
            <Tag variant="completed">
              {beneficiaries.length} {beneficiaries.length === 1 ? "Payee" : "Payees"}
            </Tag>
          </div>

          {beneficiaries.length === 0 ? (
            <p className="text-center py-10 text-ink-2 text-[12.5px]">No beneficiaries registered. Add one from the Add a Beneficiary page.</p>
          ) : (
            <div className="divide-y divide-border-lt">
              {beneficiaries.map((b) => {
                const badge = beneBadge(b);
                const pendingStatus = b.status !== "Verified";
                return (
                  <div key={b.id} className="flex items-start gap-3 px-4.5 sm:px-5 py-3.5 hover:bg-tint/70 transition-colors flex-wrap sm:flex-nowrap">
                    <span
                      className={`flex-none w-9 h-9 rounded-full flex items-center justify-center ${
                        b.internal ? "bg-[#EAF1F9] text-navy" : "bg-[#EFF8F2] text-pos"
                      }`}
                    >
                      {b.internal ? <Building2 size={16} /> : <Landmark size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-[13px] text-ink truncate">{b.name}</strong>
                        <Tag variant={badge.variant}>{badge.label}</Tag>
                        {pendingStatus ? <Tag variant="review">{b.status}</Tag> : null}
                      </div>
                      <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                        Acc: {b.account} · {beneCodeLabel(b)}
                      </p>
                      <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">Bank: {b.bankName || b.detail}</p>
                    </div>
                    <div className="flex-none flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                      {pendingStatus ? (
                        <Btn onClick={() => void completeCheck(b.id)} disabled={busyId === b.id} title="Stands in for the cooling-off period elapsing">
                          {busyId === b.id ? "Working…" : "Complete check"}
                        </Btn>
                      ) : (
                        <Link
                          to="/transfer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-3.5 py-1.5 text-xs font-semibold text-white no-underline hover:brightness-110"
                        >
                          Transfer
                        </Link>
                      )}
                      <Btn onClick={() => void removeBene(b.id)} disabled={busyId === b.id}>
                        {busyId === b.id ? "Working…" : "Delete"}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-4.5 sm:px-5 py-3.5 border-t border-border-lt">
            <Note>
              Only beneficiaries marked <strong>Verified</strong> can be selected on <Link to="/transfer">Transfer Funds</Link>. This is control
              layer 4 of the security model — holding a newly registered payee before its first settlement limits what a compromised session can
              do.
            </Note>
          </div>
        </div>

        <p className="m-0 text-[12px] text-ink-2">
          <Link to="/beneficiaries" className="font-semibold text-navy">
            + Add a Beneficiary
          </Link>
        </p>

        <div className="rounded-2xl border border-[#E3C4BC] bg-[#FDF6F4] px-4.5 sm:px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={15} className="text-neg" />
            <h3 className="m-0 text-[13px] font-bold text-[#9E2D22]">Verification is never accelerated by a payment</h3>
          </div>
          <p className="text-[12.5px] leading-relaxed mb-2 text-ink">
            A newly registered beneficiary is held before its first settlement so that an attacker who gains access to a session cannot
            immediately add their own account and drain the balance. The hold clears on the institution's own schedule, through its own checks.
          </p>
          <p className="text-[12.5px] leading-relaxed m-0 text-ink">
            No legitimate institution will offer to lift that hold in exchange for a fee, a transfer, or a "verification payment", and none will
            ask you for your password or one-time code to release it. A request of that kind is a fraud attempt regardless of who appears to be
            making it.
          </p>
        </div>
      </div>
    </>
  );
}
