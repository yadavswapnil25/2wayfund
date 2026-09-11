const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad2(n: number | string): string {
  return String(n).length < 2 ? "0" + n : String(n);
}

export function formatStamp(d: Date): string {
  return (
    pad2(d.getDate()) + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() +
    " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes())
  );
}

export function stamp(): string {
  return formatStamp(new Date());
}

export function today(): string {
  return stamp().slice(0, 11);
}

export function clockTime(): string {
  return stamp().slice(12);
}

export function todayIso(): string {
  const d = new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

/** Today's date, shifted back by `years` — used to express an age bound
 * (e.g. "at least 18 years old") as a comparable ISO date, matching how
 * the backend expresses the same bound (now()->subYears(n), 2wayfund-API
 * app/Http/Requests/SubmitApplicationRequest.php). */
export function isoYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

export function isoToDisplay(iso: string | undefined | null): string {
  if (!iso) return "—";
  const p = iso.split("-");
  if (p.length !== 3) return iso;
  return p[2] + " " + (MONTHS[Number(p[1]) - 1] || "?") + " " + p[0];
}

export function ageOn(dobIso: string, todayIsoStr: string): number {
  const d = dobIso.split("-").map(Number);
  const t = todayIsoStr.split("-").map(Number);
  let age = t[0] - d[0];
  if (t[1] < d[1] || (t[1] === d[1] && t[2] < d[2])) age -= 1;
  return age;
}

export function validateDob(iso: string): string | null {
  if (!iso) return "Enter a date of birth.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "Enter a valid date.";
  if (iso > todayIso()) return "Date of birth cannot be in the future.";
  const age = ageOn(iso, todayIso());
  if (age < 18) return "Applicant must be 18 or over — this date gives an age of " + age + ".";
  if (age > 100) return "Check the year — this date gives an age of " + age + ".";
  return null;
}

export function validateValueDate(iso: string, accountOpenedIso: string): string | null {
  if (!iso) return "Enter a value date.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "Enter a valid date.";
  if (iso > todayIso()) return "A value date cannot be in the future.";
  if (iso < accountOpenedIso) return "A value date cannot precede the account opening on " + isoToDisplay(accountOpenedIso) + ".";
  return null;
}
