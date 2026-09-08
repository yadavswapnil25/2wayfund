// SWIFT/BIC: 6 letters (bank + country) then 2 alphanumerics, optional
// 3-character branch. IFSC: 4-letter bank code, a literal 0, then a
// 6-character branch code.
export const SWIFT_FORMAT = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
export const IFSC_FORMAT = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Same shape as this account's own panelCode ("PNL-IN-4817") — an internal
// beneficiary is another 2 Way Fund customer, so their panel number
// follows the institution's one convention.
export const PANEL_CODE_FORMAT = /^PNL-[A-Z]{2}-\d{4}$/;

export const REFERRAL_FORMAT = /^2WF-[A-Z0-9]{6}$/;

export const CIF_FORMATS = {
  reference: {
    re: /^2WF[A-Z]{2}\d{5}$/,
    hint: "Format 2WFXX00000 — two letters for the segment, then five digits, no separators.",
  },
  pan: {
    re: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    hint: "Ten characters: five letters, four digits, then one letter.",
  },
  account: {
    re: /^[A-Za-z0-9]{4,18}$/,
    hint: "4–18 letters or digits. Stored and shown in full.",
  },
};

/** Phone: digits, spaces and a single leading +, 7-15 digits overall. */
export function validPhone(v: string): boolean {
  const t = String(v).trim();
  if (!/^\+?[0-9 ]+$/.test(t)) return false;
  const digits = t.replace(/[^0-9]/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
