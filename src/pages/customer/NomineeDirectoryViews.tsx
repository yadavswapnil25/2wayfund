import { History, User, Users } from "lucide-react";
import { Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { ageOn, todayIso } from "../../lib/dates";
import type { Nominee, NomineeAuditEntry } from "../../types/data";

/** The nominee directory and nomination-history views for NomineesPage —
 * split out purely to keep that page within this project's file-length
 * ceiling; both are pure presentational views driven by state the parent
 * page already holds. */

function isMinorDob(dob: string): boolean {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  if (dob > todayIso()) return false;
  return ageOn(dob, todayIso()) < 18;
}

interface DirectoryProps {
  nominees: Nominee[];
  editingId: string | null;
  submitting: boolean;
  onEdit: (nominee: Nominee) => void;
  onRequestRemoval: (id: string) => void;
  onCancelRemoval: (id: string) => void;
  onCancelChange: (id: string) => void;
  onViewIdProof: (nominee: Nominee) => void;
}

export function NomineeDirectory({
  nominees,
  editingId,
  submitting,
  onEdit,
  onRequestRemoval,
  onCancelRemoval,
  onCancelChange,
  onViewIdProof,
}: DirectoryProps) {
  const active = nominees.find((n) => n.status === "Active") ?? null;
  const pendingChange = nominees.find((n) => n.status === "Pending Approval") ?? null;

  return (
    <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
        <div className="flex items-center gap-3">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <Users size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Registered Nominee Directory</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {active ? `${active.name} is registered as your nominee` : "No nominee registered on your NetBanking profile"}
            </p>
          </div>
        </div>
        <Tag variant="completed">
          {nominees.length} {nominees.length === 1 ? "Nominee" : "Nominees"}
        </Tag>
      </div>

      {nominees.length === 0 ? (
        <p className="text-center py-10 text-ink-2 text-[12.5px]">No nominee registered. Add one using the form.</p>
      ) : (
        <div className="divide-y divide-border-lt">
          {nominees.map((nm) => {
            const nmMinor = isMinorDob(nm.dob);
            const isOpen = editingId === nm.id;
            const isPendingChange = nm.status === "Pending Approval";
            return (
              <div
                key={nm.id}
                className={`flex items-start gap-3 px-4.5 sm:px-5 py-3.5 transition-colors flex-wrap sm:flex-nowrap ${isOpen ? "bg-[#F4F8FC]" : "hover:bg-tint/70"}`}
              >
                <span className="flex-none w-9 h-9 rounded-full bg-[#EAF1F9] text-navy flex items-center justify-center">
                  <User size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[13px] text-ink truncate">{nm.name}</strong>
                    <Tag variant="processing">{nm.relationship}</Tag>
                    {nmMinor ? <Tag variant="pending">Minor</Tag> : null}
                    {isPendingChange ? <Tag variant="pending">Change pending approval</Tag> : null}
                    {nm.status === "Active" && nm.removalRequested ? <Tag variant="pending">Removal pending approval</Tag> : null}
                  </div>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                    DOB: {nm.dob} · Age {ageOn(nm.dob, todayIso())}
                  </p>
                  {nmMinor ? (
                    <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                      Guardian: {nm.guardianName || "—"}
                      {nm.guardianRelationship ? ` (${nm.guardianRelationship})` : ""}
                    </p>
                  ) : null}
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">{nm.address}</p>
                </div>
                <div className="flex-none flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                  {nm.hasIdProof ? (
                    <button
                      type="button"
                      onClick={() => onViewIdProof(nm)}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-50"
                    >
                      View ID proof
                    </button>
                  ) : null}

                  {isPendingChange ? (
                    <button
                      type="button"
                      onClick={() => onCancelChange(nm.id)}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-50"
                    >
                      Withdraw request
                    </button>
                  ) : nm.removalRequested ? (
                    <button
                      type="button"
                      onClick={() => onCancelRemoval(nm.id)}
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-50"
                    >
                      Withdraw removal request
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(nm)}
                        disabled={submitting || !!pendingChange}
                        className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
                      >
                        Request Change
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestRemoval(nm.id)}
                        disabled={submitting || !!pendingChange}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-50"
                      >
                        Request Removal
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-4.5 sm:px-5 py-3.5 border-t border-border-lt">
        <Note>
          A nominee under 18 cannot receive funds directly, so a guardian must be named at registration — the guardian holds the entitlement until
          the nominee reaches majority. Once a nominee is registered, any change to their details or a removal must be approved by the bank
          before it takes effect.
        </Note>
      </div>
    </div>
  );
}

export function NomineeHistory({ entries }: { entries: NomineeAuditEntry[] }) {
  return (
    <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
        <div className="flex items-center gap-3">
          <span className="flex-none w-10 h-10 rounded-xl bg-tint text-ink-2 flex items-center justify-center">
            <History size={17} />
          </span>
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Nomination History</h3>
        </div>
        <span className="text-[11px] text-ink-2">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-center py-10 text-ink-2 text-[12.5px]">No nomination activity yet.</p>
      ) : (
        <div className="divide-y divide-border-lt">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 px-4.5 sm:px-5 py-2.5 text-[12.5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-border flex-none" />
              <span className="text-ink-2 font-num flex-none">{entry.at}</span>
              <span className="text-ink">{entry.action}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4.5 sm:px-5 py-3.5 border-t border-border-lt">
        <Note>
          Every registration, variation and cancellation is recorded. A nomination change is never actioned over the telephone, and nobody from
          the institution will ask you for a password or one-time code to make one on your behalf.
        </Note>
      </div>
    </div>
  );
}
