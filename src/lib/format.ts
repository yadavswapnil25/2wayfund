export const MASK = "••••••";

export const SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", INR: "₹", GBP: "£", CAD: "C$", JPY: "¥", AUD: "A$", SGD: "S$", CHF: "CHF ",
};

/** Indian grouping (last 3 digits, then pairs) for INR; standard thousands
 * grouping for everything else. */
export function groupDigits(intStr: string, currency: string): string {
  if (currency === "INR") {
    if (intStr.length <= 3) return intStr;
    const last3 = intStr.slice(-3);
    const rest = intStr.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatNumber(amount: number, currency: string): string {
  let n = Number(amount);
  if (!isFinite(n)) n = 0;
  const neg = n < 0;
  const parts = Math.abs(n).toFixed(2).split(".");
  return (neg ? "−" : "") + groupDigits(parts[0], currency) + "." + parts[1];
}

export function formatMoney(amount: number, currency: string): string {
  return (SYMBOL[currency] || "") + formatNumber(amount, currency);
}

export function formatCode(amount: number, currency: string): string {
  return currency + " " + formatNumber(amount, currency);
}

export function displayMoney(amount: number, currency: string, balancesHidden: boolean): string {
  return balancesHidden ? (SYMBOL[currency] || "") + MASK : formatMoney(amount, currency);
}

export function displayCode(amount: number, currency: string, balancesHidden: boolean): string {
  return balancesHidden ? currency + " " + MASK : formatCode(amount, currency);
}

export function maskAccount(raw: string): string {
  const clean = String(raw).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.length <= 4) return "XXXXXXXX" + clean;
  return "XXXXXXXX" + clean.slice(-4);
}

export function groupInFours(digits: string): string {
  return String(digits).replace(/(.{4})(?=.)/g, "$1 ");
}

/** Derives 2-letter initials from an invented name for a CSS-only avatar
 * badge — no image asset, no network fetch. */
export function monogram(name: string): string {
  const words = name.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("");
}
