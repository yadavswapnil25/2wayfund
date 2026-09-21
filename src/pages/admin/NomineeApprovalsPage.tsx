import { useCallback, useEffect, useState } from "react";
import { UserMinus, UserRoundPen } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Btn } from "../../components/ui/Button";
import { DetailGrid, LoadingBlock, Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { ageOn, todayIso } from "../../lib/dates";
import {
  approveNomineeChange,
  approveNomineeRemoval,
  getNomineeIdProofForReview,
  listPendingNomineeChanges,
  listPendingNomineeRemovals,
  rejectNomineeChange,
  rejectNomineeRemoval,
  type NomineeApprovalSnapshot,
  type NomineeChangeRequest,
  type NomineeRemovalRequest,
} from "../../services/nomineeApprovalService";
import { ApiError } from "../../services/apiClient";

function snapshotItems(snap: NomineeApprovalSnapshot): [string, string, string?][] {
  return [
    ["Name", snap.name],
    ["Relationship", snap.relationship],
    ["Date of birth", snap.dob, `Age ${ageOn(snap.dob, todayIso())}`],
    ["Address", snap.address],
    ...(snap.guardianName ? ([["Guardian", snap.guardianName, snap.guardianRelationship]] as [string, string, string?][]) : []),
  ];
}

/** The staff queue for nominee changes and removals — a customer's edit
 * or removal request against an already-Active nominee lands here
 * instead of taking effect immediately, so it always needs one of these
 * two decisions before anything changes on their account. */
export function NomineeApprovalsPage() {
  const { session } = useApp();
  const [changes, setChanges] = useState<NomineeChangeRequest[] | null>(null);
  const [removals, setRemovals] = useState<NomineeRemovalRequest[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string | null>>({});

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) {
        setLoadError("Your session has no API token — sign out and sign back in.");
        return;
      }
      try {
        const [realChanges, realRemovals] = await Promise.all([
          listPendingNomineeChanges(session.token, signal),
          listPendingNomineeRemovals(session.token, signal),
        ]);
        setChanges(realChanges);
        setRemovals(realRemovals);
        setLoadError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load the nominee approval queue. Please try again.");
      }
    },
    [session.token],
  );

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  async function viewIdProof(id: string) {
    if (!session.token) return;
    const result = await getNomineeIdProofForReview(id, session.token);
    if (!result) return;
    window.open(result.url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(result.url), 60_000);
  }

  async function decideChange(id: string, decision: "approve" | "reject") {
    if (!session.token || busyId) return;
    setBusyId(id);
    setRowError((e) => ({ ...e, [id]: null }));
    try {
      await (decision === "approve" ? approveNomineeChange : rejectNomineeChange)(id, session.token);
      await refresh();
    } catch (err) {
      setRowError((e) => ({ ...e, [id]: err instanceof ApiError ? err.message : "Could not record that decision. Please try again." }));
    } finally {
      setBusyId(null);
    }
  }

  async function decideRemoval(id: string, decision: "approve" | "reject") {
    if (!session.token || busyId) return;
    setBusyId(id);
    setRowError((e) => ({ ...e, [id]: null }));
    try {
      await (decision === "approve" ? approveNomineeRemoval : rejectNomineeRemoval)(id, session.token);
      await refresh();
    } catch (err) {
      setRowError((e) => ({ ...e, [id]: err instanceof ApiError ? err.message : "Could not record that decision. Please try again." }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHead
        title="Nominee Approvals"
        lede="A customer's edit or removal against an already-registered nominee waits here until it's approved or rejected — the current nominee stays exactly as it is until then."
      />

      {changes === null || removals === null ? (
        loadError ? (
          <Note danger className="mb-5">
            {loadError}
          </Note>
        ) : (
          <LoadingBlock label="Loading the approval queue…" />
        )
      ) : (
        <div className="grid gap-5">
          <section className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
              <div className="flex items-center gap-3">
                <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
                  <UserRoundPen size={17} />
                </span>
                <h3 className="m-0 text-[14.5px] font-bold text-navy">Pending Nominee Changes</h3>
              </div>
              <Tag variant="pending">
                {changes.length} {changes.length === 1 ? "request" : "requests"}
              </Tag>
            </div>

            {changes.length === 0 ? (
              <p className="text-center py-10 text-ink-2 text-[12.5px]">No nominee change requests awaiting approval.</p>
            ) : (
              <div className="divide-y divide-border-lt">
                {changes.map((req) => (
                  <div key={req.id} className="px-4.5 sm:px-5 py-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <strong className="text-[13px] text-ink">{req.customer.name}</strong>
                        <span className="ml-2 text-[11.5px] text-ink-2 font-num">
                          {req.customer.reference} · {req.customer.accountNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-2">Submitted {req.submitted}</span>
                    </div>

                    <div className="grid gap-4 min-[800px]:grid-cols-2 mb-3">
                      {req.replaces ? (
                        <div>
                          <p className="text-[10.5px] uppercase text-ink-2 font-semibold mb-1.5">Current nominee</p>
                          <DetailGrid items={snapshotItems(req.replaces)} />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-[10.5px] uppercase text-ink-2 font-semibold mb-1.5">Proposed change</p>
                        <DetailGrid items={snapshotItems(req.proposed)} />
                      </div>
                    </div>

                    {rowError[req.id] ? <Note danger className="mb-2.5">{rowError[req.id]}</Note> : null}

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {req.hasIdProof ? (
                        <Btn onClick={() => void viewIdProof(req.id)} disabled={busyId === req.id}>
                          View ID proof
                        </Btn>
                      ) : null}
                      <Btn variant="approve" onClick={() => void decideChange(req.id, "approve")} disabled={busyId === req.id}>
                        {busyId === req.id ? "Working…" : "Approve"}
                      </Btn>
                      <Btn variant="reject" onClick={() => void decideChange(req.id, "reject")} disabled={busyId === req.id}>
                        Reject
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
              <div className="flex items-center gap-3">
                <span className="flex-none w-10 h-10 rounded-xl bg-[#FDF6F4] text-neg flex items-center justify-center">
                  <UserMinus size={17} />
                </span>
                <h3 className="m-0 text-[14.5px] font-bold text-navy">Pending Nominee Removals</h3>
              </div>
              <Tag variant="pending">
                {removals.length} {removals.length === 1 ? "request" : "requests"}
              </Tag>
            </div>

            {removals.length === 0 ? (
              <p className="text-center py-10 text-ink-2 text-[12.5px]">No nominee removal requests awaiting approval.</p>
            ) : (
              <div className="divide-y divide-border-lt">
                {removals.map((req) => (
                  <div key={req.id} className="px-4.5 sm:px-5 py-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <strong className="text-[13px] text-ink">{req.customer.name}</strong>
                        <span className="ml-2 text-[11.5px] text-ink-2 font-num">
                          {req.customer.reference} · {req.customer.accountNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-2">Requested {req.requested}</span>
                    </div>

                    <DetailGrid items={snapshotItems(req.nominee)} />

                    {rowError[req.id] ? <Note danger className="mb-2.5">{rowError[req.id]}</Note> : null}

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {req.hasIdProof ? (
                        <Btn onClick={() => void viewIdProof(req.id)} disabled={busyId === req.id}>
                          View ID proof
                        </Btn>
                      ) : null}
                      <Btn variant="approve" onClick={() => void decideRemoval(req.id, "approve")} disabled={busyId === req.id}>
                        {busyId === req.id ? "Working…" : "Approve removal"}
                      </Btn>
                      <Btn variant="reject" onClick={() => void decideRemoval(req.id, "reject")} disabled={busyId === req.id}>
                        Reject
                      </Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
