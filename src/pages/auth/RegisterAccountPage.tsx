import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { ApiError } from "../../services/apiClient";
import { confirmRegistrationOtp, verifyRegistrationIdentity } from "../../services/registrationService";

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches AdminLoginPage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

type Stage = "identity" | "otp";

export function RegisterAccountPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("identity");

  const [reference, setReference] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [secureCode, setSecureCode] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitIdentity() {
    if (submitting) return;
    if (!reference.trim() || !idNumber.trim() || !accountNumber.trim() || !/^\d{8}$/.test(secureCode)) {
      setError("Fill in every field — the secure code is exactly 8 digits.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await verifyRegistrationIdentity({ reference: reference.trim(), idNumber: idNumber.trim(), accountNumber: accountNumber.trim(), secureCode });
      setNotice("A one-time code has been sent to the email on file for this account.");
      setStage("otp");
    } catch (err) {
      setError(firstErrorMessage(err, "Could not verify those details. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOtp() {
    if (submitting) return;
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await confirmRegistrationOtp(reference.trim(), otp);
      navigate(`/set-password?email=${encodeURIComponent(result.email)}&token=${encodeURIComponent(result.token)}`);
    } catch (err) {
      setError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp() {
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await verifyRegistrationIdentity({ reference: reference.trim(), idNumber: idNumber.trim(), accountNumber: accountNumber.trim(), secureCode });
      setNotice("A new one-time code has been sent.");
    } catch (err) {
      setError(firstErrorMessage(err, "Could not resend a code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-navy-lt to-navy text-white mb-3 shadow-sm">
          {stage === "identity" ? <UserCheck size={24} /> : <ShieldCheck size={24} />}
        </div>
        <h1 className="text-[19px] font-bold text-navy mb-1">Register for Online Access</h1>
        <p className="m-0 text-[12.5px] text-ink-2">
          {stage === "identity"
            ? "For an account already opened for you by our team. Enter the details given to you at account opening."
            : "Enter the one-time code just emailed to the address on file for this account."}
        </p>
      </div>

      <Panel className="mb-4">
        <PanelBody>
          {error ? <Note danger className="mb-3.5">{error}</Note> : null}
          {notice && !error ? <Note className="mb-3.5">{notice}</Note> : null}

          {stage === "identity" ? (
            <>
              <Field label="Customer ID / User ID" htmlFor="reg-reference" className="mb-3.5">
                <TextInput id="reg-reference" value={reference} onChange={(e) => setReference(e.target.value)} autoComplete="off" spellCheck={false} />
              </Field>

              <Field label="Aadhaar or PAN Number" htmlFor="reg-id-number" className="mb-3.5">
                <TextInput id="reg-id-number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} autoComplete="off" spellCheck={false} />
              </Field>

              <Field label="Bank Account Number" htmlFor="reg-account-number" className="mb-3.5">
                <TextInput id="reg-account-number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} autoComplete="off" spellCheck={false} />
              </Field>

              <Field label="8-Digit Secure Code" htmlFor="reg-secure-code" hint="Given to you when your account was opened." className="mb-4">
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                  <TextInput
                    id="reg-secure-code"
                    className="pl-9"
                    value={secureCode}
                    onChange={(e) => setSecureCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    inputMode="numeric"
                    autoComplete="off"
                    onKeyDown={(e) => e.key === "Enter" && void submitIdentity()}
                  />
                </div>
              </Field>

              <Btn variant="block" onClick={() => void submitIdentity()} disabled={submitting}>
                {submitting ? "Verifying…" : "Verify & Send Code"}
              </Btn>
            </>
          ) : (
            <>
              <Field label="One-Time Code" htmlFor="reg-otp" hint="6 digits, expires 10 minutes after it's sent." className="mb-4">
                <TextInput
                  id="reg-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="off"
                  onKeyDown={(e) => e.key === "Enter" && void submitOtp()}
                />
              </Field>

              <Btn variant="block" onClick={() => void submitOtp()} disabled={submitting}>
                {submitting ? "Confirming…" : "Confirm Code"}
              </Btn>

              <p className="mt-3 mb-0 text-center text-[12px]">
                <button type="button" onClick={() => void resendOtp()} disabled={submitting} className="font-semibold text-navy underline disabled:opacity-50">
                  Resend code
                </button>
                {" · "}
                <button
                  type="button"
                  onClick={() => {
                    setStage("identity");
                    setOtp("");
                    setError(null);
                    setNotice(null);
                  }}
                  className="font-semibold text-ink-2 underline"
                >
                  Start over
                </button>
              </p>
            </>
          )}

          <p className="mt-4 mb-0 text-center text-[12px]">
            <Link to="/login" className="font-semibold text-navy">
              Already registered? Sign in
            </Link>
          </p>
        </PanelBody>
      </Panel>
    </>
  );
}
