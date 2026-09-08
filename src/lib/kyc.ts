import type { Application, Kyc, KycDocument } from "../types/data";
import { clockTime, today } from "./dates";

export interface KycDocMeta {
  id: string;
  name: string;
  note: string;
}

export const KYC_DOCS: KycDocMeta[] = [
  { id: "photo", name: "Photograph", note: "Recent passport-style photograph of the applicant." },
  {
    id: "signature",
    name: "Specimen signature",
    note: "Signature as it will appear on instructions. Draw it here or upload a scan on plain white paper.",
  },
  {
    id: "aadhaar",
    name: "Aadhaar card",
    note: "Proof of identity and address. A production system captures this through a UIDAI-authorised channel and stores only a masked reference, never the full number.",
  },
  { id: "pan", name: "PAN card", note: "Tax identification, required for accounts above the reporting threshold." },
];

export const KYC_STAGES: { label: string; sub: string }[] = [
  { label: "Application submitted", sub: "Form received" },
  { label: "Documents provided", sub: "All four items" },
  { label: "Under verification", sub: "With reviewer" },
  { label: "Video KYC", sub: "Slot booked" },
  { label: "Verified", sub: "Identity cleared" },
];

export const VIDEO_KYC_SLOTS = ["10 Sep 2026 10:00", "10 Sep 2026 15:30", "12 Sep 2026 11:00", "12 Sep 2026 16:00"];

export function freshKyc(): Kyc {
  return {
    status: "Not started",
    videoSlot: null,
    documents: KYC_DOCS.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.id,
      note: d.note,
      status: "Not provided",
      filename: null,
      size: null,
      received: null,
    })),
  };
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/** 1-based stage index into KYC_STAGES, for driving the progress Stepper. */
export function kycStageIndex(kyc: Kyc): number {
  if (kyc.status === "Verified") return 5;
  if (kyc.videoSlot) return 4;
  if (kyc.status === "Under verification" || kyc.status === "Rejected") return 3;
  if (kyc.documents.every((d) => d.status !== "Not provided")) return 2;
  return 1;
}

/** Gives the seeded application queue a spread of KYC states on first visit
 * to the eKYC page, so there is something to look at besides an empty
 * checklist. Fabricated metadata only — no document ever existed to preview. */
const KYC_SEED_PRESET: Record<string, Kyc["status"]> = {
  "2WF-APP-10229": "Rejected",
  "2WF-APP-10231": "Not started",
  "2WF-APP-10232": "Under verification",
  "2WF-APP-10233": "Verified",
};

export function seedKycForApplications(apps: Application[]): Application[] {
  let changed = false;
  const next = apps.map((a) => {
    if (a.kyc) return a;
    changed = true;
    const kyc = freshKyc();
    const want = KYC_SEED_PRESET[a.ref];
    if (want && want !== "Not started") {
      const sizes = [412, 38, 268, 194];
      const times = ["10:14", "10:15", "10:16", "10:18"];
      kyc.documents = kyc.documents.map((d, i) => {
        const ext = d.id === "photo" ? ".jpg" : d.id === "signature" ? ".png" : ".pdf";
        const status: KycDocument["status"] =
          want === "Verified" ? "Verified" : want === "Rejected" ? (d.id === "aadhaar" ? "Rejected" : "Verified") : "Received";
        return {
          ...d,
          filename: `${d.id}_${a.ref}${ext}`,
          size: `${sizes[i]} KB`,
          received: `${a.submitted} ${times[i]} (seeded)`,
          status,
          note: status === "Rejected" ? "Document illegible — re-submission required" : d.note,
        };
      });
      kyc.status = want;
      if (want === "Verified") kyc.videoSlot = `${a.submitted} 15:30`;
    }
    return { ...a, kyc };
  });
  return changed ? next : apps;
}

export function stampCapture(): string {
  return `${today()} ${clockTime()}`;
}
