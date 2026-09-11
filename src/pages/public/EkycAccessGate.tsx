import { useState, type FormEvent } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Field, FormActions, FormGrid, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { confirmEkycAccess, initiateEkycAccess } from "../../services/applicationService";
import { ApiError } from "../../services/apiClient";
import type { Application } from "../../types/data";

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches every other OTP-gated
 * page this session). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

type Stage = "form" | "otp";

/** Recovers a public visitor's own eKYC record without the application
 * reference itself — a customer who already has an account but has lost
 * the emailed link proves it's them with their Customer ID and an
 * emailed one-time code, then lands on exactly the same eKYC flow a
 * direct reference link would have opened. Shown on the public eKYC page
 * only when there's no reference in the URL and no signed-in customer
 * session to resolve an application from directly. */
export function EkycAccessGate({ onResolved }: { onResolved: (application: Omit<Application, "kyc">) => void }) {
  const [stage, setStage] = useState<Stage>("form");
  const [customerId, setCustomerId] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitLookup(e: FormEvent) {
    e.preventDefault();
    if (submitting || !customerId.trim()) {
      if (!customerId.trim()) setError("Enter your Customer ID.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await initiateEkycAccess(customerId.trim());
      setStage("otp");
      setOtpInput("");
    } catch (err) {
      setError(firstErrorMessage(err, "Could not start eKYC access. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmOtp() {
    if (submitting) return;
    if (!/^\d{6}$/.test(otpInput)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const application = await confirmEkycAccess(customerId.trim(), otpInput);
      onResolved(application);
    } catch (err) {
      setError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4.5 sm:px-5 py-5">
      <div className="max-w-[420px] mx-auto text-center mb-4">
        <span className="inline-flex w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy items-center justify-center mb-2.5">
          <ShieldCheck size={18} />
        </span>
        <h3 className="m-0 text-[14px] font-bold text-navy">Access Your eKYC Record</h3>
        <p className="m-0 mt-1.5 text-[12px] text-ink-2">
          Already have an account but lost the link to your identity verification? Enter your Customer ID and we'll email a one-time code to the
          address on file.
        </p>
      </div>

      {error ? (
        <div className="max-w-[380px] mx-auto mb-3">
          <Note danger>{error}</Note>
        </div>
      ) : null}

      {stage === "form" ? (
        <form onSubmit={(e) => void submitLookup(e)} className="max-w-[380px] mx-auto">
          <FormGrid>
            <Field label="Customer ID (CIF)" required wide>
              <TextInput
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. 2WFMP04817"
                autoComplete="off"
              />
            </Field>
            <FormActions className="flex-col items-stretch">
              <Btn type="submit" variant="block" disabled={submitting}>
                {submitting ? "Sending code…" : "Send One-Time Code"}
              </Btn>
            </FormActions>
          </FormGrid>
        </form>
      ) : (
        <div className="max-w-[380px] mx-auto bg-tint border border-border-lt rounded-xl p-4 text-[12.5px]">
          <span className="flex items-center gap-1.5 font-bold text-navy mb-2">
            <KeyRound size={14} /> Enter the one-time code we emailed you
          </span>
          <div>Check the email on file for Customer ID {customerId} — the code expires 10 minutes after it's sent, and can only be used once.</div>
          <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
            <input
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && void confirmOtp()}
              inputMode="numeric"
              autoComplete="off"
              className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-lg"
              aria-label="One-time code"
            />
            <Btn variant="approve" onClick={() => void confirmOtp()} disabled={submitting}>
              {submitting ? "Confirming…" : "Confirm"}
            </Btn>
            <Btn onClick={() => setStage("form")} disabled={submitting}>
              Cancel
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
