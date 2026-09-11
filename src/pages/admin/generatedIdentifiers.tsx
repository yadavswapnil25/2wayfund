import { RefreshCw } from "lucide-react";
import { Field, TextInput } from "../../components/ui/Field";

function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

function randomLetters(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function generateReference(): string {
  return `2WF${randomLetters(2)}${randomDigits(5)}`;
}

export function generateAccountNumber(): string {
  return randomDigits(12);
}

export function generatePanelCode(country: string): string {
  const letters = country.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase().padEnd(2, "X");
  return `PNL-${letters || "XX"}-${randomDigits(4)}`;
}

export function generatePin(): string {
  return randomDigits(9);
}

export function generateSecureCode(): string {
  return randomDigits(8);
}

/** A field with its own regenerate button — the admin can accept the
 * suggested value or clear and type a custom one; the backend fills in a
 * fresh generated value server-side for anything left blank. */
export function GeneratedField({
  label,
  htmlFor,
  value,
  onChange,
  onGenerate,
  required,
  hint,
  error,
}: {
  label: string;
  htmlFor: string;
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <Field label={label} htmlFor={htmlFor} required={required} hint={hint} error={error}>
      <div className="flex gap-1.5">
        <TextInput id={htmlFor} value={value} onChange={(e) => onChange(e.target.value)} hasError={!!error} autoComplete="off" spellCheck={false} />
        <button
          type="button"
          onClick={onGenerate}
          aria-label={`Generate a new ${label}`}
          className="flex-none inline-flex items-center justify-center w-9 rounded-[5px] border border-border bg-tint text-ink-2 hover:text-navy hover:bg-panel-head"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </Field>
  );
}
