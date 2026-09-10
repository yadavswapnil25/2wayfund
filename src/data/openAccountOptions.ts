/** Fixed option lists for the Open an Account wizard's select fields.
 * Mirrors the design prototype (2wayfund-prototype.html) so the same
 * choices are offered on both. The backend does not enforce these lists
 * (SubmitApplicationRequest validates them as free strings, matching how
 * country/tier/purpose are already handled) — they exist to give the
 * applicant a consistent, guided set of choices, not a closed enum. */

export const EDUCATION_LEVELS = ["10th standard", "12th standard", "Bachelor degree", "Bachelor degree +"];

export const TURNOVER_BANDS = [
  "Not applicable",
  "Below USD 50,000",
  "USD 50,000 – 250,000",
  "USD 250,000 – 1,000,000",
  "USD 1,000,000 – 10,000,000",
  "Above USD 10,000,000",
];

export const INCOME_BANDS = [
  "Below USD 25,000",
  "USD 25,000 – 75,000",
  "USD 75,000 – 150,000",
  "USD 150,000 – 500,000",
  "Above USD 500,000",
];

export const HOME_STATUS_OPTIONS = ["Owned", "Rented", "Family-owned", "Employer-provided"];

export const CAR_STATUS_OPTIONS = ["Owned", "Leased", "Company-provided", "None"];

export const OCCUPATIONS = ["Salaried", "Self-employed", "Business owner", "Professional practice", "Retired", "Student"];

export const CROSS_BORDER_REASONS = [
  "Business operations in that country",
  "Employment or salary credited abroad",
  "Family remittance",
  "Education abroad",
  "Investment or treasury management",
  "Supplier or vendor settlement",
];

/** The seven named stages of account opening (2wayfund-API
 * app/Services/ApplicationService.php owns stage 5 onward). Stages 1–5
 * are interactive on this page; stages 6–7 happen afterwards in the
 * Compliance Console and on the live account, so this page can only ever
 * show them as pending. */
export const OPENING_STEPS = [
  "Account selection",
  "Application",
  "Identity & business verification",
  "Financial requirement",
  "Compliance review",
  "Account approval",
  "International payment services",
] as const;

/** Where a submitted application's lifecycle status places it on
 * OPENING_STEPS, for the confirmation screen's stepper. By the time an
 * application exists at all, the applicant has completed stages 1–5
 * (this page enforces that); stage 6 is the compliance officer's
 * decision, stage 7 is the account going live. */
export function stageForStatus(status: "Submitted" | "Under review" | "Approved" | "Rejected"): number {
  return status === "Approved" ? 7 : 6;
}
