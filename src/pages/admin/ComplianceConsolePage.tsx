import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ImageOff,
  Landmark,
  MapPin,
  ScrollText,
  Search,
  ShieldCheck,
  Ticket,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Tag } from "../../components/ui/Tag";
import { Callout, DetailGrid } from "../../components/ui/Misc";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useApp } from "../../state/AppContext";
import type { Application, Kyc, KycDocument } from "../../types/data";
import { ageOn, isoToDisplay, stamp, todayIso } from "../../lib/dates";
import { formatCode } from "../../lib/format";
import { seedKycForApplications } from "../../lib/kyc";
import { OPENING_STEPS, stageForStatus } from "../../data/openAccountOptions";
import {
  deleteApplication,
  getApplicationBusinessCertificate,
  getApplicationPhoto,
  getApplicationSignature,
  listApplications,
  type ApplicationDocument,
  type ApplicationListMeta,
} from "../../services/applicationService";
import { ApiError } from "../../services/apiClient";

/** A titled, bordered, collapsible card for one group of read-only
 * details — the same card-per-section treatment used for the applicant's
 * own compliance-review recap (2wayfund-react
 * src/pages/public/OpenAccountPage.tsx's ReviewSection), so a reviewer
 * sees the application organised the same way the applicant did. Starts
 * closed so an application's full detail doesn't dump onto the screen at
 * once; the header opens whichever section a reviewer actually needs. */
function DetailCard({
  icon,
  title,
  items,
  children,
}: {
  icon: ReactNode;
  title: string;
  items?: [string, ReactNode][];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-border-lt rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-border-lt bg-tint text-left cursor-pointer"
      >
        <span className="text-navy flex-none">{icon}</span>
        <span className="text-[12.5px] font-bold text-navy flex-1">{title}</span>
        <ChevronDown size={14} className={`text-ink-2 flex-none transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className={items ? "px-4 pt-3.5 pb-0.5" : ""}>{items ? <DetailGrid items={items} /> : children}</div> : null}
    </div>
  );
}

/** One "Uploaded"/"Missing" tag plus, once uploaded, a "View" trigger —
 * used for Photo, Signature and Business certificate alike in the
 * application status strip. */
function DocumentStatus({ label, uploaded, onView }: { label: string; uploaded?: boolean; onView: () => void }) {
  return (
    <span className="flex items-center gap-1.5 text-[11.5px] text-ink-2">
      {label} <Tag variant={uploaded ? "approved" : "review"}>{uploaded ? "Uploaded" : "Missing"}</Tag>
      {uploaded ? (
        <button type="button" onClick={onView} className="text-[11px] font-semibold text-navy underline">
          View
        </button>
      ) : null}
    </span>
  );
}

function appTagVariant(status: Application["status"]): string {
  if (status === "Approved") return "approved";
  if (status === "Rejected") return "rejected";
  if (status === "Under review") return "review";
  return "submitted";
}

type DocKind = "photo" | "signature" | "business-certificate";

const DOC_FETCHERS: Record<DocKind, (ref: string, token: string, signal?: AbortSignal) => Promise<ApplicationDocument | null>> = {
  photo: getApplicationPhoto,
  signature: getApplicationSignature,
  "business-certificate": getApplicationBusinessCertificate,
};

const DOC_LABELS: Record<DocKind, string> = {
  photo: "Photograph",
  signature: "Signature",
  "business-certificate": "Business certificate",
};

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
  const { store, session } = useApp();
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [meta, setMeta] = useState<ApplicationListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [docView, setDocView] = useState<{ ref: string; kind: DocKind } | null>(null);
  const [doc, setDoc] = useState<ApplicationDocument | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  // Fetches the actual document only once a "View" button is clicked,
  // not for every uploaded document on every row — these are
  // authenticated, one-off blob fetches (apiFetchBlob), not something to
  // prefetch in bulk.
  useEffect(() => {
    if (!docView || !session.token) return;
    const controller = new AbortController();
    setDoc(null);
    setDocError(null);
    setDocLoading(true);
    DOC_FETCHERS[docView.kind](docView.ref, session.token, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result === null) {
          setDocError("This document could not be found — it may not have finished uploading.");
        } else {
          setDoc(result);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDocError(err instanceof ApiError ? err.message : "Could not load this document. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setDocLoading(false);
      });
    return () => controller.abort();
  }, [docView, session.token]);

  // The object URL is only ever referenced by the modal that fetched it —
  // revoke on every change (new document, or the modal closing) so a
  // reviewer paging through several applications' documents doesn't leak
  // one blob URL per click for the rest of the session.
  useEffect(() => {
    return () => {
      if (doc) URL.revokeObjectURL(doc.url);
    };
  }, [doc]);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) {
        setLoadError("Your session has no API token — sign out and sign back in to load the queue.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const result = await listApplications(session.token, { email: search || undefined, page }, signal);
        // Gives the queue a spread of KYC states on first load, so there is
        // something to adjudicate beyond a bare document checklist.
        setApplications(seedKycForApplications(result.items));
        setMeta(result.meta);
        setLoading(false);
      } catch (err) {
        // An aborted request (StrictMode's dev-only double-mount, or
        // navigating away mid-fetch) isn't a real failure — the component
        // that started it is already gone, so there's nothing to update.
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load the application queue. Please try again.");
        setLoading(false);
      }
    },
    [session.token, search, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(emailInput.trim());
  }

  function clearSearch() {
    setEmailInput("");
    setPage(1);
    setSearch("");
  }

  function updateApp(ref: string, fn: (a: Application) => Application) {
    setApplications((apps) => apps.map((a) => (a.ref === ref ? fn(a) : a)));
  }

  function decideDoc(appRef: string, docId: string, status: "Verified" | "Rejected") {
    updateApp(appRef, (a) => {
      if (!a.kyc) return a;
      const documents = a.kyc.documents.map((d) => (d.id === docId ? { ...d, status } : d));
      return settleKyc(a, { ...a.kyc, documents }, session.display);
    });
  }

  async function confirmDelete() {
    if (!deleteTarget || !session.token) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteApplication(deleteTarget.ref, session.token);
      if (openRef === deleteTarget.ref) setOpenRef(null);
      setDeleteTarget(null);
      // Deleting the only item on a page beyond the first steps back a
      // page (which re-triggers the fetch); otherwise just reload this page.
      if (applications.length === 1 && page > 1) setPage((p) => p - 1);
      else void load();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete this application. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHead title="Application Console" lede="Review account-opening applications and their eKYC documents." />

      {loadError ? (
        <Callout title="Couldn't load the application queue" variant="warn" className="mb-5">
          <p>{loadError}</p>
        </Callout>
      ) : null}

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt flex-wrap">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <ClipboardCheck size={17} />
          </span>
          <div className="flex-1 min-w-[160px]">
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Application Queue</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {loading
                ? "Loading…"
                : meta
                  ? `${meta.total} ${meta.total === 1 ? "application" : "applications"}${meta.lastPage > 1 ? ` · page ${meta.currentPage} of ${meta.lastPage}` : ""}`
                  : "0 applications"}
            </p>
          </div>

          <form onSubmit={submitSearch} className="flex items-center gap-2 flex-none">
            <Field htmlFor="app-search-email" className="mb-0">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                <TextInput
                  id="app-search-email"
                  type="text"
                  placeholder="Search by email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="pl-8 pr-8 py-1.5 text-xs w-[220px]"
                />
                {emailInput ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-2 hover:text-navy"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </Field>
            <Btn type="submit" className="!py-1.5">
              Search
            </Btn>
          </form>
        </div>

        {search ? (
          <p className="m-0 px-4.5 sm:px-5 py-2 text-[11px] text-ink-2 bg-tint border-b border-border-lt">
            Showing results for email containing "<strong className="text-ink">{search}</strong>" —{" "}
            <button type="button" onClick={clearSearch} className="text-navy font-semibold underline">
              clear
            </button>
          </p>
        ) : null}

        {loading ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">Loading the application queue…</p>
        ) : applications.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">
            {search ? `No applications found for an email containing "${search}".` : "No applications in the queue."}
          </p>
        ) : (
          <div className="divide-y divide-border-lt">
            {applications.map((a) => {
              const isOpen = a.ref === openRef;
              const kyc = a.kyc;
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
                    <div className="flex items-center gap-2 flex-none">
                      <button
                        type="button"
                        onClick={() => setOpenRef(isOpen ? null : a.ref)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint"
                      >
                        {isOpen ? "Close" : "Review"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(a);
                        }}
                        aria-label={`Delete application ${a.ref}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E3B8B0] bg-white px-3 py-1.5 text-xs font-semibold text-neg hover:bg-[#FDF6F4]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="px-4.5 sm:px-5 pb-5 bg-tint/40 flex flex-col gap-4">
                      <div className="grid gap-4 sm:grid-cols-2 items-start">
                        <DetailCard
                          icon={<Ticket size={14} />}
                          title="Application"
                          items={[
                            ["Referral code", a.referral || "—"],
                            ["Referred by", a.referrer || "—"],
                            ["Terms accepted", a.termsAcceptedAt || "—"],
                          ]}
                        />
                        <DetailCard
                          icon={<Landmark size={14} />}
                          title="Account requested"
                          items={[
                            ["Purpose", a.purpose],
                            ["Account class", a.tier],
                            ...(a.fatherName ? ([["Father's / husband's name", a.fatherName]] as [string, string][]) : []),
                            ...(tier ? ([["Min. opening", formatCode(tier.openingAmt, tier.currency)]] as [string, string][]) : []),
                          ]}
                        />
                      </div>

                      {a.dob ? (
                        <div className="grid gap-4 sm:grid-cols-3 items-start">
                          <DetailCard
                            icon={<UserRound size={14} />}
                            title="Contact"
                            items={[
                              ["Email", a.email],
                              ["Date of birth", `${isoToDisplay(a.dob)} (age ${ageOn(a.dob, todayIso())})`],
                              ...(a.education ? ([["Education", a.education]] as [string, string][]) : []),
                              ...(a.mobilePersonal ? ([["Personal mobile", a.mobilePersonal]] as [string, string][]) : []),
                              ...(a.mobileOfficial ? ([["Official mobile", a.mobileOfficial]] as [string, string][]) : []),
                              ...(a.landline ? ([["Landline", a.landline]] as [string, string][]) : []),
                            ]}
                          />
                          <DetailCard
                            icon={<MapPin size={14} />}
                            title="Address"
                            items={[
                              ...(a.addressCommunication ? ([["Communication", a.addressCommunication]] as [string, string][]) : []),
                              ...(a.addressPermanent ? ([["Permanent", a.addressPermanent]] as [string, string][]) : []),
                              ...(a.addressOffice ? ([["Office", a.addressOffice]] as [string, string][]) : []),
                            ]}
                          />
                          <DetailCard
                            icon={<Building2 size={14} />}
                            title="Business & financial"
                            items={[
                              ...(a.organisation ? ([["Organisation", a.organisation]] as [string, string][]) : []),
                              ...(a.occupation ? ([["Occupation", a.occupation]] as [string, string][]) : []),
                              ...(a.annualTurnover ? ([["Annual turnover", a.annualTurnover]] as [string, string][]) : []),
                              ...(a.annualIncome ? ([["Annual income", a.annualIncome]] as [string, string][]) : []),
                              ...(a.homeStatus ? ([["Home status", a.homeStatus]] as [string, string][]) : []),
                              ...(a.carStatus ? ([["Car status", a.carStatus]] as [string, string][]) : []),
                              ...(a.crossBorderReason ? ([["Cross-border reason", a.crossBorderReason]] as [string, string][]) : []),
                              ...(a.crossBorderDetail ? ([["Cross-border detail", a.crossBorderDetail]] as [string, string][]) : []),
                            ]}
                          />
                        </div>
                      ) : null}

                      {kyc ? (
                        <DetailCard icon={<ShieldCheck size={14} />} title={`eKYC verification — ${kyc.status}`}>
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
                        </DetailCard>
                      ) : null}

                      <DetailCard icon={<ScrollText size={14} />} title="Audit trail">
                        <ol className="list-none m-0 divide-y divide-border-lt">
                          {a.audit.map((e, i) => (
                            <li key={i} className="flex flex-wrap items-baseline gap-x-2.5 px-4 py-2 text-[11.5px]">
                              <span className="font-num text-ink-2 w-[128px] flex-none">{e.at}</span>
                              <span className="font-semibold text-navy">{e.actor}</span>
                              <span className="text-ink">{e.action}</span>
                            </li>
                          ))}
                        </ol>
                      </DetailCard>

                      <div className="bg-white border border-border-lt rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="text-[11.5px] text-ink-2">
                          Process stage{" "}
                          <strong className="text-navy">
                            {stageForStatus(a.status)} — {OPENING_STEPS[stageForStatus(a.status) - 1]}
                          </strong>{" "}
                          of {OPENING_STEPS.length}
                        </span>
                        <span className="w-px h-4 bg-border-lt hidden sm:block" />
                        <DocumentStatus label="Photo" uploaded={a.hasPhoto} onView={() => setDocView({ ref: a.ref, kind: "photo" })} />
                        <DocumentStatus label="Signature" uploaded={a.hasSignature} onView={() => setDocView({ ref: a.ref, kind: "signature" })} />
                        {a.tier.startsWith("Corporate Account") ? (
                          <DocumentStatus
                            label="Business certificate"
                            uploaded={a.hasBusinessCertificate}
                            onView={() => setDocView({ ref: a.ref, kind: "business-certificate" })}
                          />
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {meta && meta.lastPage > 1 ? (
          <div className="flex items-center justify-between gap-3 px-4.5 sm:px-5 py-3 border-t border-border-lt">
            <button
              type="button"
              disabled={meta.currentPage <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <span className="text-[11px] text-ink-2">
              Page {meta.currentPage} of {meta.lastPage}
            </span>
            <button
              type="button"
              disabled={meta.currentPage >= meta.lastPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-tint disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        ) : null}
      </div>

      {deleteTarget ? (
        <Modal
          title={
            <span className="flex items-center gap-1.5 text-neg">
              <Trash2 size={15} /> Delete application?
            </span>
          }
          onClose={() => (deleting ? null : setDeleteTarget(null))}
          footerExtra={
            <Btn variant="reject" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete permanently"}
            </Btn>
          }
        >
          {deleteError ? (
            <Callout title="Couldn't delete this application" variant="warn">
              <p>{deleteError}</p>
            </Callout>
          ) : null}
          <p>
            Delete <strong className="text-navy">{deleteTarget.ref}</strong> ({deleteTarget.name}, {deleteTarget.email})? This removes the
            application and its uploaded documents permanently — it cannot be undone.
          </p>
          {deleteTarget.customerId ? (
            <p className="text-ink-2">
              This application already provisioned a customer account — that account is not affected, only this application record.
            </p>
          ) : null}
        </Modal>
      ) : null}

      {docView ? (
        <Modal
          title={`${DOC_LABELS[docView.kind]} — ${docView.ref}`}
          onClose={() => setDocView(null)}
          footerExtra={
            doc && !doc.isImage ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-xs font-semibold text-navy hover:bg-tint"
              >
                Open PDF in a new tab
              </a>
            ) : undefined
          }
        >
          {docLoading ? (
            <p className="text-center py-8 text-ink-2">Loading…</p>
          ) : docError ? (
            <Callout title="Couldn't load this document" variant="warn">
              <p>{docError}</p>
            </Callout>
          ) : doc?.isImage ? (
            <img src={doc.url} alt={`${DOC_LABELS[docView.kind]} for ${docView.ref}`} className="w-full rounded-lg border border-border-lt" />
          ) : doc ? (
            <p className="text-ink-2">
              This document is a PDF, not an image — use "Open PDF in a new tab" below to view it.
            </p>
          ) : (
            <p className="flex items-center gap-2 justify-center py-8 text-ink-2">
              <ImageOff size={16} /> Nothing to show.
            </p>
          )}
        </Modal>
      ) : null}
    </>
  );
}
