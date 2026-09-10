import { useEffect, useState } from "react";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import type { Application, Kyc, KycDocument } from "../../types/data";
import { ageOn, isoToDisplay, stamp, todayIso } from "../../lib/dates";
import { formatCode } from "../../lib/format";
import { seedKycForApplications } from "../../lib/kyc";
import { OPENING_STEPS, stageForStatus } from "../../data/openAccountOptions";

const APP_STATUSES: Application["status"][] = ["Submitted", "Under review", "Approved", "Rejected"];

function appTagVariant(status: Application["status"]): string {
  if (status === "Approved") return "approved";
  if (status === "Rejected") return "rejected";
  if (status === "Under review") return "review";
  return "submitted";
}

function docTagVariant(status: KycDocument["status"]): string {
  if (status === "Verified") return "approved";
  if (status === "Rejected") return "rejected";
  if (status === "Received") return "review";
  return "submitted";
}

function settleKyc(a: Application, kyc: Kyc, actor: string): Application {
  const before = a.kyc?.status;
  let status: Kyc["status"] = kyc.status;
  if (kyc.documents.some((d) => d.status === "Rejected")) status = "Rejected";
  else if (kyc.documents.every((d) => d.status === "Verified")) status = "Verified";
  else status = "Under verification";

  const nextKyc = { ...kyc, status };
  const audit =
    status !== before ? [...a.audit, { at: stamp(), actor, action: `eKYC ${status.toLowerCase()}` }] : a.audit;
  return { ...a, kyc: nextKyc, audit };
}

export function ComplianceConsolePage() {
  const { store, setStore, session } = useApp();
  const [openRef, setOpenRef] = useState<string | null>(null);

  // Gives the prospect queue a spread of KYC states on first visit, so
  // there is something to adjudicate beyond the customer's own record.
  useEffect(() => {
    setStore((s) => {
      const applications = seedKycForApplications(s.applications);
      return applications === s.applications ? s : { ...s, applications };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateApp(ref: string, fn: (a: Application) => Application) {
    setStore((s) => ({ ...s, applications: s.applications.map((a) => (a.ref === ref ? fn(a) : a)) }));
  }

  function decideDoc(appRef: string, docId: string, status: "Verified" | "Rejected") {
    updateApp(appRef, (a) => {
      if (!a.kyc) return a;
      const documents = a.kyc.documents.map((d) => (d.id === docId ? { ...d, status } : d));
      return settleKyc(a, { ...a.kyc, documents }, session.display);
    });
  }

  function transition(ref: string, status: Application["status"], note: string) {
    updateApp(ref, (a) => ({ ...a, status, audit: [...a.audit, { at: stamp(), actor: session.display, action: note }] }));
  }

  const counts = APP_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = store.applications.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <PageHead title="Compliance Console" lede="Review, approve or reject account-opening applications." />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        {APP_STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-border-lt bg-white px-4.5 py-4 shadow-sm">
            <span className="block text-[10.5px] uppercase text-ink-2 font-semibold">{s}</span>
            <div className="mt-1 font-num tabular-nums text-[22px] font-bold text-navy">{counts[s]}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <ClipboardCheck size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Application Queue</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {store.applications.length} {store.applications.length === 1 ? "application" : "applications"}
            </p>
          </div>
        </div>

        {store.applications.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No applications in the queue.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {store.applications.map((a) => {
              const isOpen = a.ref === openRef;
              const kyc = a.kyc;
              const kycCleared = kyc?.status === "Verified";
              const terminal = a.status === "Approved" || a.status === "Rejected";
              const tier = store.tiers.find((t) => t.name === a.tier);

              return (
                <div key={a.ref}>
                  <div className="flex flex-wrap items-center gap-3 px-4.5 sm:px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-num font-bold text-[13px] text-navy">{a.ref}</span>
                        <Tag variant={appTagVariant(a.status)}>{a.status}</Tag>
                      </div>
                      <p className="m-0 mt-0.5 text-[12px] text-ink">
                        {a.name} · {a.tier}
                      </p>
                      <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                        {a.email} · {a.country} · submitted {a.submitted}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenRef(isOpen ? null : a.ref)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint flex-none"
                    >
                      {isOpen ? "Close" : "Review"}
                    </button>
                  </div>

                  {isOpen ? (
                    <div className="px-4.5 sm:px-5 pb-5 bg-tint/40">
                      <p className="m-0 mb-1 text-[11px] text-ink-2">
                        Process stage: <strong className="text-navy">{stageForStatus(a.status)} — {OPENING_STEPS[stageForStatus(a.status) - 1]}</strong>
                        {" "}of {OPENING_STEPS.length}
                      </p>
                      <p className="m-0 mb-3 text-[11px] text-ink-2 flex items-center gap-1.5 flex-wrap">
                        Signature: <Tag variant={a.hasSignature ? "approved" : "review"}>{a.hasSignature ? "Uploaded" : "Missing"}</Tag>
                        {a.tier.startsWith("Corporate Account") ? (
                          <>
                            Business certificate:{" "}
                            <Tag variant={a.hasBusinessCertificate ? "approved" : "review"}>
                              {a.hasBusinessCertificate ? "Uploaded" : "Missing"}
                            </Tag>
                          </>
                        ) : null}
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2 mb-4">
                        <div>
                          <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Application</p>
                          {[
                            ["Referral code", a.referral || "—"],
                            ["Referred by", a.referrer || "—"],
                            ["Terms accepted", a.termsAcceptedAt || "—"],
                          ].map(([k, v]) => (
                            <p key={k} className="m-0 mb-1 text-[12px] text-ink">
                              <span className="text-ink-2">{k}: </span>
                              {v}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Account requested</p>
                          {[
                            ["Purpose", a.purpose],
                            ["Account class", a.tier],
                            a.fatherName ? ["Father's / husband's name", a.fatherName] : null,
                          ]
                            .filter((p): p is [string, string] => p !== null)
                            .map(([k, v]) => (
                              <p key={k} className="m-0 mb-1 text-[12px] text-ink">
                                <span className="text-ink-2">{k}: </span>
                                {v}
                              </p>
                            ))}
                          {tier ? (
                            <p className="m-0 mt-2 text-[12.5px] font-bold text-navy">
                              Min. opening: {formatCode(tier.openingAmt, tier.currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {a.dob ? (
                        <div className="grid gap-4 sm:grid-cols-3 mb-4">
                          <div>
                            <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Applicant &amp; contact</p>
                            {[
                              ["Date of birth", `${isoToDisplay(a.dob)}${a.dob ? ` (age ${ageOn(a.dob, todayIso())})` : ""}`],
                              a.education ? ["Education", a.education] : null,
                              a.mobilePersonal ? ["Personal mobile", a.mobilePersonal] : null,
                              a.mobileOfficial ? ["Official mobile", a.mobileOfficial] : null,
                              a.landline ? ["Landline", a.landline] : null,
                            ]
                              .filter((p): p is [string, string] => p !== null)
                              .map(([k, v]) => (
                                <p key={k} className="m-0 mb-1 text-[12px] text-ink">
                                  <span className="text-ink-2">{k}: </span>
                                  {v}
                                </p>
                              ))}
                          </div>
                          <div>
                            <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Address</p>
                            {[
                              a.addressCommunication ? ["Communication", a.addressCommunication] : null,
                              a.addressPermanent ? ["Permanent", a.addressPermanent] : null,
                              a.addressOffice ? ["Office", a.addressOffice] : null,
                            ]
                              .filter((p): p is [string, string] => p !== null)
                              .map(([k, v]) => (
                                <p key={k} className="m-0 mb-1 text-[12px] text-ink">
                                  <span className="text-ink-2">{k}: </span>
                                  {v}
                                </p>
                              ))}
                          </div>
                          <div>
                            <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Business &amp; financial</p>
                            {[
                              a.organisation ? ["Organisation", a.organisation] : null,
                              a.occupation ? ["Occupation", a.occupation] : null,
                              a.annualTurnover ? ["Annual turnover", a.annualTurnover] : null,
                              a.annualIncome ? ["Annual income", a.annualIncome] : null,
                              a.homeStatus ? ["Home status", a.homeStatus] : null,
                              a.carStatus ? ["Car status", a.carStatus] : null,
                              a.crossBorderReason ? ["Cross-border reason", a.crossBorderReason] : null,
                              a.crossBorderDetail ? ["Cross-border detail", a.crossBorderDetail] : null,
                            ]
                              .filter((p): p is [string, string] => p !== null)
                              .map(([k, v]) => (
                                <p key={k} className="m-0 mb-1 text-[12px] text-ink">
                                  <span className="text-ink-2">{k}: </span>
                                  {v}
                                </p>
                              ))}
                          </div>
                        </div>
                      ) : null}

                      {kyc ? (
                        <div className="bg-white border border-border-lt rounded-xl overflow-hidden mb-4">
                          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-lt">
                            <ShieldCheck size={14} className="text-navy" />
                            <span className="text-[12.5px] font-bold text-navy">eKYC verification — {kyc.status}</span>
                          </div>
                          <div className="divide-y divide-border-lt">
                            {kyc.documents.map((d) => (
                              <div key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5 flex-wrap">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[12.5px] font-semibold text-ink">{d.name}</span>
                                    <Tag variant={docTagVariant(d.status)}>{d.status}</Tag>
                                  </div>
                                  <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                                    {d.filename ? `${d.filename} · ${d.size} · captured ${d.received}` : "Not provided"}
                                  </p>
                                  {d.status === "Rejected" ? (
                                    <p className="m-0 mt-0.5 text-[11px] font-semibold text-neg">Did not pass verification — re-submission required</p>
                                  ) : null}
                                </div>
                                {d.status === "Received" ? (
                                  <div className="flex gap-2 flex-none">
                                    <button
                                      type="button"
                                      onClick={() => decideDoc(a.ref, d.id, "Verified")}
                                      className="inline-flex items-center gap-1 rounded-full border border-[#166138] bg-gradient-to-b from-[#2C9159] to-[#1C7A46] px-3 py-1 text-[11px] font-semibold text-white hover:brightness-110"
                                    >
                                      Verify
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => decideDoc(a.ref, d.id, "Rejected")}
                                      className="inline-flex items-center gap-1 rounded-full border border-[#9E2D22] bg-gradient-to-b from-[#D0503F] to-neg px-3 py-1 text-[11px] font-semibold text-white hover:brightness-110"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-wide text-ink-2">Audit trail</p>
                        <ol className="list-none m-0 mb-4 bg-white border border-border-lt rounded-xl divide-y divide-border-lt">
                          {a.audit.map((e, i) => (
                            <li key={i} className="flex flex-wrap items-baseline gap-x-2.5 px-4 py-2 text-[11.5px]">
                              <span className="font-num text-ink-2 w-[128px] flex-none">{e.at}</span>
                              <span className="font-semibold text-navy">{e.actor}</span>
                              <span className="text-ink">{e.action}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          disabled={a.status !== "Submitted"}
                          onClick={() => transition(a.ref, "Under review", "Moved to review")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                          Move to Review
                        </button>
                        <button
                          type="button"
                          disabled={terminal || !kycCleared}
                          title={!terminal && !kycCleared ? "Identity verification must pass before an account can be approved." : undefined}
                          onClick={() => transition(a.ref, "Approved", "Approved — account provisioning queued")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#166138] bg-gradient-to-b from-[#2C9159] to-[#1C7A46] px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={terminal}
                          onClick={() => transition(a.ref, "Rejected", "Rejected — did not meet review criteria")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#9E2D22] bg-gradient-to-b from-[#D0503F] to-neg px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
                        >
                          Reject
                        </button>
                        <span className="text-[11px] text-ink-2">
                          {terminal
                            ? "Decision recorded. Terminal state — no further transitions available."
                            : !kycCleared
                              ? "Approval is blocked until eKYC verification passes — verify each document above first."
                              : "Decisions are recorded against the in-memory record only."}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
