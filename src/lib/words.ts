const WORDS_ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const WORDS_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n: number): string {
  if (n < 20) return WORDS_ONES[n];
  const tens = Math.floor(n / 10), ones = n % 10;
  return WORDS_TENS[tens] + (ones ? " " + WORDS_ONES[ones] : "");
}

function threeDigitWords(n: number): string {
  const h = Math.floor(n / 100), rest = n % 100;
  let out = h ? WORDS_ONES[h] + " Hundred" : "";
  if (rest) out += (out ? " " : "") + twoDigitWords(rest);
  return out;
}

/** Indian-numbering (lakh/crore) amount-to-words. Rupees only — paise are
 * rounded away, since every seeded and demo amount here is a whole rupee
 * figure. */
export function amountInWordsInr(amount: number): string {
  let n = Math.round(Math.abs(Number(amount) || 0));
  if (n === 0) return "Zero Rupees";

  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;

  const parts: string[] = [];
  if (crore) parts.push(threeDigitWords(crore) + " Crore");
  if (lakh) parts.push(twoDigitWords(lakh) + " Lakh");
  if (thousand) parts.push(twoDigitWords(thousand) + " Thousand");
  if (hundred) parts.push(threeDigitWords(hundred));
  return parts.join(" ") + " Rupees";
}
