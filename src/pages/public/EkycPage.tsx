import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Camera,
  Check,
  ClipboardList,
  FileText,
  IdCard,
  Loader2,
  PenLine,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Stepper } from "../../components/ui/Stepper";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import type { Application, KycDocument } from "../../types/data";
import { KYC_DOCS, KYC_STAGES, VIDEO_KYC_SLOTS, freshKyc, humanSize, kycStageIndex, stampCapture } from "../../lib/kyc";
import { stamp } from "../../lib/dates";
import { ApiError } from "../../services/apiClient";
import { getApplication, uploadApplicationPhoto } from "../../services/applicationService";

const DOC_ICONS: Record<string, typeof Camera> = { photo: Camera, signature: PenLine, aadhaar: IdCard, pan: IdCard };

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function docTagVariant(status: KycDocument["status"]): string {
  if (status === "Verified") return "approved";
  if (status === "Rejected") return "rejected";
  if (status === "Received") return "review";
  return "submitted";
}

export function EkycPage() {
  const { store, setStore } = useApp();
  const [searchParams] = useSearchParams();
  // A ref in the URL means we arrived from a real Apply for an Account
  // submission — that application lives in the real backend, so its photo
  // upload should too. Without one (e.g. reached via nav), we're looking
  // at the seeded demo data, which the real backend has never heard of.
  const refParam = searchParams.get("ref");
  const [previews, setPreviews] = useState<Record<string, { url: string; mime: string }>>({});
  const [cameraDocId, setCameraDocId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [signatureDocId, setSignatureDocId] = useState<string | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [slot, setSlot] = useState(VIDEO_KYC_SLOTS[0]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | null>>({});
  const [fetchingApplication, setFetchingApplication] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  useEffect(() => stopCamera, []);

  const app = useMemo(
    () => store.applications.find((a) => (refParam ? a.ref === refParam : a.customerId === store.user.id)) ?? null,
    [store.applications, store.user.id, refParam]
  );

  // The application only lives in this browser tab's memory once someone
  // has clicked through from Apply for an Account in the same session — a
  // reload, a bookmarked link, or (as here) navigating straight to this
  // URL loses it, even though it's real and still on the backend.
  useEffect(() => {
    if (!refParam || app) return;
    let cancelled = false;
    setFetchingApplication(true);
    setFetchError(null);
    getApplication(refParam)
      .then((application) => {
        if (cancelled) return;
        setStore((s) => ({ ...s, applications: [{ ...application, kyc: freshKyc() }, ...s.applications] }));
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err instanceof ApiError ? err.message : "Could not load this application.");
      })
      .finally(() => {
        if (!cancelled) setFetchingApplication(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refParam, app, setStore]);

  const kyc = app?.kyc ?? null;
  const locked = kyc ? kyc.status === "Verified" || kyc.status === "Under verification" : false;
  const allProvided = kyc ? kyc.documents.every((d) => d.status !== "Not provided") : false;

  function updateApp(ref: string, fn: (a: Application) => Application) {
    setStore((s) => ({ ...s, applications: s.applications.map((a) => (a.ref === ref ? fn(a) : a)) }));
  }

  async function attachCapture(docId: string, blob: Blob, filename: string, mime: string) {
    if (!app || !app.kyc) return;
    const key = `${app.ref}:${docId}`;
    setPreviews((p) => {
      const prev = p[key];
      if (prev) URL.revokeObjectURL(prev.url);
      return { ...p, [key]: { url: URL.createObjectURL(blob), mime } };
    });
    updateApp(app.ref, (a) => {
      if (!a.kyc) return a;
      const wasRejected = a.kyc.status === "Rejected";
      return {
        ...a,
        kyc: {
          ...a.kyc,
          status: wasRejected ? "Not started" : a.kyc.status,
          documents: a.kyc.documents.map((d) =>
            d.id === docId ? { ...d, status: "Received", filename, size: humanSize(blob.size), received: stampCapture(), note: KYC_DOCS.find((k) => k.id === docId)?.note ?? d.note } : d
          ),
        },
      };
    });

    // Only the photo is wired to real persistence so far, and only for a
    // real (backend-known) application — everything else stays the local
    // browser-tab simulation described in the advisory panel below.
    if (docId !== "photo" || !refParam) return;

    setUploadErrors((e) => ({ ...e, [key]: null }));
    setUploading((u) => ({ ...u, [key]: true }));
    try {
      await uploadApplicationPhoto(refParam, blob, filename);
    } catch (err) {
      setUploadErrors((e) => ({ ...e, [key]: err instanceof ApiError ? err.message : "Upload failed. Please try again." }));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  }

  function removeDoc(docId: string) {
    if (!app) return;
    const key = `${app.ref}:${docId}`;
    setPreviews((p) => {
      const prev = p[key];
      if (prev) URL.revokeObjectURL(prev.url);
      const { [key]: _drop, ...rest } = p;
      return rest;
    });
    updateApp(app.ref, (a) =>
      a.kyc
        ? { ...a, kyc: { ...a.kyc, documents: a.kyc.documents.map((d) => (d.id === docId ? { ...d, status: "Not provided", filename: null, size: null, received: null } : d)) } }
        : a
    );
  }

  function pickFile(docId: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_TYPES.join(",");
    input.style.display = "none";
    input.addEventListener("change", () => {
      const f = input.files?.[0];
      document.body.removeChild(input);
      if (!f) return;
      if (!ACCEPTED_TYPES.includes(f.type)) {
        window.alert("Choose a PNG, JPEG, WebP or PDF file.");
        return;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        window.alert(`File is ${humanSize(f.size)}. The limit is ${humanSize(MAX_UPLOAD_BYTES)}.`);
        return;
      }
      attachCapture(docId, f, f.name, f.type);
    });
    document.body.appendChild(input);
    input.click();
  }

  function openCamera(docId: string) {
    stopCamera();
    setSignatureDocId(null);
    setCameraError(null);
    setCameraDocId(docId);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not expose a camera API. Use “Choose file” instead.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch((err: Error) => {
        setCameraError(`Camera unavailable (${err.name || "denied"}). Use “Choose file” instead — the checklist works either way.`);
      });
  }

  function closeCamera() {
    stopCamera();
    setCameraDocId(null);
  }

  function capturePhoto() {
    if (!cameraDocId || !videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 480;
    const h = video.videoHeight || 360;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
    const docId = cameraDocId;
    closeCamera();
    canvas.toBlob((blob) => {
      if (blob) attachCapture(docId, blob, `live-photo_${app?.ref}.png`, "image/png");
    }, "image/png");
  }

  function openSignaturePad(docId: string) {
    closeCamera();
    setSignatureDocId(docId);
    setHasInk(false);
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#16202B";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    });
  }

  function pointerPos(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = pointerPos(e);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
    setHasInk(true);
  }

  function onPointerUp() {
    drawingRef.current = false;
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  function useSignature() {
    if (!hasInk || !canvasRef.current || !signatureDocId) return;
    const docId = signatureDocId;
    canvasRef.current.toBlob((blob) => {
      if (blob) attachCapture(docId, blob, `signature_${app?.ref}.png`, "image/png");
    }, "image/png");
    setSignatureDocId(null);
  }

  function submitForVerification() {
    if (!app || !kyc || !allProvided) return;
    updateApp(app.ref, (a) =>
      a.kyc
        ? {
            ...a,
            kyc: { ...a.kyc, status: "Under verification", documents: a.kyc.documents.map((d) => (d.status === "Not provided" ? d : d.status === "Verified" ? d : { ...d, status: "Received" })) },
            audit: [...a.audit, { at: stamp(), actor: "Applicant", action: "eKYC documents submitted for verification" }],
          }
        : a
    );
  }

  function bookSlot() {
    if (!app) return;
    updateApp(app.ref, (a) =>
      a.kyc
        ? { ...a, kyc: { ...a.kyc, videoSlot: slot }, audit: [...a.audit, { at: stamp(), actor: "Applicant", action: `Video KYC appointment booked for ${slot}` }] }
        : a
    );
  }

  const stageIdx = kyc ? kycStageIndex(kyc) : 0;

  return (
    <>
      <PageHead
        title="eKYC Verification"
        lede="Identity verification for your account. Collects nothing real — please use dummy images rather than genuine documents, and a scribble rather than a real signature."
      />

      {/* Your application */}
      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <ClipboardList size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Your Application</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">
              {app ? `${app.ref} · submitted ${app.submitted}` : "No application on file"}
            </p>
          </div>
        </div>

        {!app ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">
            {fetchingApplication
              ? "Loading your application…"
              : fetchError
                ? fetchError
                : "No identity verification record found for this account."}
          </p>
        ) : (
          <Stepper current={stageIdx} steps={KYC_STAGES} />
        )}
      </div>

      {app && kyc ? (
        <>
          {/* Documents */}
          <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
            <div className="flex items-center justify-between gap-3 flex-wrap px-4.5 sm:px-5 py-4 border-b border-border-lt">
              <div className="flex items-center gap-3">
                <span className="flex-none w-10 h-10 rounded-xl bg-[#F4EEFB] text-purple-600 flex items-center justify-center">
                  <IdCard size={17} />
                </span>
                <div>
                  <h3 className="m-0 text-[14.5px] font-bold text-navy">Documents</h3>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                    {kyc.documents.filter((d) => d.status !== "Not provided").length} of {kyc.documents.length} provided · KYC{" "}
                    {kyc.status.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border-lt">
              {kyc.documents.map((d) => {
                const Icon = DOC_ICONS[d.id] ?? IdCard;
                const preview = previews[`${app.ref}:${d.id}`];
                const canEdit = !locked && d.status !== "Verified";
                return (
                  <div key={d.id} data-testid={`doc-${d.id}`} className="px-4.5 sm:px-5 py-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <span className="flex-none w-9 h-9 rounded-full bg-tint text-ink-2 flex items-center justify-center">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-[13px] text-ink">{d.name}</strong>
                          <Tag variant={docTagVariant(d.status)}>{d.status}</Tag>
                        </div>
                        <p className="m-0 mt-0.5 text-[11.5px] text-ink-2">{d.note}</p>
                        {d.filename ? (
                          <p className="m-0 mt-1 text-[11px] text-ink-2">
                            {d.filename} · {d.size} · captured {d.received}
                          </p>
                        ) : null}
                        {d.status === "Rejected" ? (
                          <p className="m-0 mt-1 text-[11px] text-neg font-semibold">Document illegible — re-submission required</p>
                        ) : null}

                        {d.id === "photo" && refParam && uploading[`${app.ref}:${d.id}`] ? (
                          <p className="m-0 mt-1 flex items-center gap-1.5 text-[11px] text-ink-2">
                            <Loader2 size={12} className="animate-spin" /> Uploading to your application…
                          </p>
                        ) : null}
                        {d.id === "photo" && uploadErrors[`${app.ref}:${d.id}`] ? (
                          <p className="m-0 mt-1 flex items-center gap-1.5 text-[11px] text-neg font-semibold">
                            <AlertTriangle size={12} /> {uploadErrors[`${app.ref}:${d.id}`]}
                          </p>
                        ) : null}

                        {preview ? (
                          preview.mime === "application/pdf" ? (
                            <a
                              href={preview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 text-[11.5px] font-semibold text-navy-lt"
                            >
                              <FileText size={13} /> View PDF
                            </a>
                          ) : (
                            <img src={preview.url} alt="Captured document preview" className="mt-2 max-w-[160px] rounded-lg border border-border-lt" />
                          )
                        ) : null}

                        {canEdit ? (
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {d.id === "photo" ? (
                              <button
                                type="button"
                                onClick={() => openCamera(d.id)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                              >
                                <Camera size={13} /> Use camera
                              </button>
                            ) : null}
                            {d.id === "signature" ? (
                              <button
                                type="button"
                                onClick={() => openSignaturePad(d.id)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                              >
                                <PenLine size={13} /> Draw signature
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => pickFile(d.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint"
                            >
                              <Upload size={13} /> {d.status === "Not provided" ? "Choose file" : "Replace file"}
                            </button>
                            {d.status !== "Not provided" ? (
                              <button
                                type="button"
                                onClick={() => removeDoc(d.id)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#E3B8B0] bg-white px-3.5 py-1.5 text-xs font-semibold text-neg hover:bg-[#FDF6F4]"
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <p className="m-0 mt-2 text-[11px] text-ink-2">
                            {d.status === "Verified" || kyc.status === "Verified" ? "Verified — no change permitted" : "Locked while under review"}
                          </p>
                        )}

                        {/* Inline camera panel */}
                        {cameraDocId === d.id ? (
                          <div className="mt-3 rounded-xl border border-border-lt bg-tint p-3 max-w-xs">
                            {cameraError ? (
                              <p className="m-0 text-[11.5px] text-neg">{cameraError}</p>
                            ) : (
                              <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-black aspect-video" />
                                <p className="m-0 mt-2 text-[10.5px] text-ink-2">
                                  The frame is captured locally and released immediately. No video is recorded and nothing is transmitted.
                                </p>
                              </>
                            )}
                            <div className="flex gap-2 mt-2.5">
                              {!cameraError ? (
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  disabled={!cameraReady}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-45"
                                >
                                  Capture photo
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={closeCamera}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint"
                              >
                                <X size={13} /> Close
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {/* Inline signature panel */}
                        {signatureDocId === d.id ? (
                          <div className="mt-3 rounded-xl border border-border-lt bg-tint p-3 max-w-sm">
                            <canvas
                              ref={canvasRef}
                              width={360}
                              height={140}
                              onPointerDown={onPointerDown}
                              onPointerMove={onPointerMove}
                              onPointerUp={onPointerUp}
                              onPointerLeave={onPointerUp}
                              className="w-full rounded-lg border border-border-lt bg-white touch-none"
                            />
                            <p className="m-0 mt-1.5 text-[10.5px] text-ink-2">
                              Drawn locally and held in this browser tab. Use a scribble rather than your real signature.
                            </p>
                            <div className="flex gap-2 mt-2.5">
                              <button
                                type="button"
                                onClick={useSignature}
                                disabled={!hasInk}
                                className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-45"
                              >
                                <Check size={13} /> Use this signature
                              </button>
                              <button
                                type="button"
                                onClick={clearSignature}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint"
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                onClick={() => setSignatureDocId(null)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-tint"
                              >
                                <X size={13} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit for verification */}
            <div className="px-4.5 sm:px-5 py-4 border-t border-border-lt">
              {kyc.status === "Verified" ? (
                <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3">
                  <h3 className="text-pos font-bold mb-1.5 text-sm">Identity verified</h3>
                  <p className="m-0 text-xs">All documents cleared review. The application can now be approved in the compliance console.</p>
                </div>
              ) : kyc.status === "Under verification" ? (
                <div className="rounded-xl border border-border-lt bg-[#EAF1F9] p-4 mb-3">
                  <h3 className="m-0 text-[13px] font-bold text-navy">With the verification team</h3>
                  <p className="m-0 mt-1 text-xs text-ink">Documents are submitted and awaiting adjudication in the compliance console. Nothing further is required from the applicant.</p>
                </div>
              ) : kyc.status === "Rejected" ? (
                <div className="rounded-xl border border-[#E3C4BC] bg-[#FDF6F4] p-4 mb-3">
                  <h3 className="m-0 text-[13px] font-bold text-[#9E2D22]">Re-submission required</h3>
                  <p className="m-0 mt-1 text-xs text-ink">One or more documents did not pass verification. Replace the flagged item above and submit again.</p>
                </div>
              ) : null}

              {!locked ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={submitForVerification}
                    disabled={!allProvided}
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-45"
                  >
                    Submit for verification
                  </button>
                  <span className="text-[11px] text-ink-2">
                    {allProvided ? "Sends the checklist to the compliance console for adjudication." : `Provide all ${kyc.documents.length} items before submitting.`}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Video KYC appointment */}
          <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
            <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
              <span className="flex-none w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber flex items-center justify-center">
                <Video size={17} />
              </span>
              <div>
                <h3 className="m-0 text-[14.5px] font-bold text-navy">Video KYC Appointment</h3>
                <p className="m-0 mt-0.5 text-[11px] text-ink-2">Session is conducted off-platform — no camera is requested here</p>
              </div>
            </div>
            <div className="px-4.5 sm:px-5 py-4">
              {kyc.videoSlot ? (
                <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4">
                  <h3 className="text-pos font-bold mb-1.5 text-sm">Appointment booked</h3>
                  <p className="m-0 text-xs">
                    Video KYC scheduled for {kyc.videoSlot}. A reviewer conducts the session on the institution's own platform — it is not
                    conducted in this prototype, and no camera is ever requested.
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-3 flex-wrap">
                  <div className="min-w-[220px]">
                    <label className="block mb-1 text-[11.5px] font-semibold text-ink">Preferred slot</label>
                    <select
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="w-full text-[13px] px-2.5 py-2 border border-border bg-white rounded-lg focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20"
                    >
                      {VIDEO_KYC_SLOTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={bookSlot}
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  >
                    Book Appointment
                  </button>
                  <span className="text-[11px] text-ink-2">Books a slot only. No session is started and no camera is accessed.</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Advisory */}
      <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 sm:px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={15} className="text-amber" />
          <h3 className="m-0 text-[13px] font-bold text-navy">Nothing collected is real</h3>
        </div>
        <p className="text-[12.5px] leading-relaxed m-0 text-ink">
          {refParam
            ? "Your photograph is uploaded to this demonstration's backend and stored against your application for this case study — everything else here (signature, Aadhaar, PAN, and the video appointment) stays a local simulation, held only as an object URL in this browser tab."
            : "Files captured here are held as local object URLs scoped to this browser tab and are never uploaded — nothing selected or photographed leaves the browser."}{" "}
          Video KYC is modelled as a booked appointment rather than a live session; the actual session is conducted off-platform.
        </p>
      </div>
    </>
  );
}
