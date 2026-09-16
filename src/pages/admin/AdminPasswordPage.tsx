import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { confirmPasswordChange, initiatePasswordChange } from "../../services/securityService";
import { ApiError } from "../../services/apiClient";
import { LOGIN_NOTICE_KEY } from "../../data/constants";
import { OtpBox } from "../customer/PinSecurityPage";

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches PinSecurityPage,
 * ExchangePage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

type Stage = "form" | "otp";

/** Staff self-service password change — the same real, OTP-gated backend
 * flow the customer-facing 9-Digit PIN & Security page uses
 * (2wayfund-API SecurityController::initiatePassword/confirmPassword sits
 * outside the customer/admin route split, so any authenticated account
 * can use it), just without the transaction-PIN half that has no meaning
 * for a staff account. */
export function AdminPasswordPage() {
  const { session, logout } = useApp();
  const navigate = useNavigate();

  const [auth, setAuth] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (submitting) return;
    const errs: Record<string, string | null> = {};
    if (!auth) errs.auth = "Enter your current password.";
    if (next.length < 8) errs.next = "Password must be at least 8 characters.";
    if (!confirm) errs.confirm = "Re-enter the new password.";
    else if (confirm !== next) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (!session.token) {
      setFormError("Your session has no API token — sign out and sign back in.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await initiatePasswordChange({ currentCredential: auth, newPassword: next, newPasswordConfirmation: confirm }, session.token);
      setStage("otp");
      setOtpInput("");
      setOtpError(null);
    } catch (err) {
      setFormError(firstErrorMessage(err, "Could not start the password change. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmOtp() {
    if (submitting || !session.token) return;
    if (!/^\d{6}$/.test(otpInput)) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setOtpError(null);
    setSubmitting(true);
    try {
      await confirmPasswordChange(otpInput, session.token);
      // The password just changed, so this session's credentials are
      // stale by definition — sign out and send staff back to Staff Log
      // In to prove the new one actually works, matching how the
      // customer-facing PIN & Security page forces re-authentication.
      try {
        sessionStorage.setItem(LOGIN_NOTICE_KEY, "Your password has been changed. Please sign in with your new password.");
      } catch {
        // sessionStorage can throw (private browsing, disabled storage) —
        // staff still gets signed out and redirected either way.
      }
      navigate("/admin-login");
      logout();
    } catch (err) {
      setOtpError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHead title="Change Password" lede="Update the password used to sign in to the Application Console." />

      <div className="max-w-[520px]">
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
              <Lock size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Change Staff Password</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Signed in as {session.display}</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            {formError ? <Note danger>{formError}</Note> : null}

            {stage === "form" ? (
              <FormGrid>
                <Field label="Current password" htmlFor="admin-pw-current" required wide error={errors.auth}>
                  <TextInput id="admin-pw-current" type="password" value={auth} onChange={(e) => setAuth(e.target.value)} hasError={!!errors.auth} />
                </Field>
                <Field
                  label="New password"
                  htmlFor="admin-pw-new"
                  required
                  wide
                  error={errors.next}
                  hint={!errors.next ? "Minimum 8 characters" : undefined}
                >
                  <TextInput id="admin-pw-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} hasError={!!errors.next} />
                </Field>
                <Field label="Confirm new password" htmlFor="admin-pw-confirm" required wide error={errors.confirm}>
                  <TextInput
                    id="admin-pw-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    hasError={!!errors.confirm}
                  />
                </Field>
                <FormActions className="flex-col items-stretch">
                  <Btn variant="block" onClick={() => void submit()} disabled={submitting}>
                    {submitting ? "Sending code…" : "Update Password"}
                  </Btn>
                  <Note className="!m-0">A one-time code will be emailed to the address on file before this takes effect.</Note>
                </FormActions>
              </FormGrid>
            ) : null}

            {stage === "otp" ? (
              <OtpBox
                otpInput={otpInput}
                setOtpInput={setOtpInput}
                error={otpError}
                submitting={submitting}
                onConfirm={() => void confirmOtp()}
                onCancel={() => setStage("form")}
              />
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 sm:px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={15} className="text-amber" />
            <h3 className="m-0 text-[13px] font-bold text-navy">Security Reminder</h3>
          </div>
          <p className="text-[12.5px] leading-relaxed m-0 text-ink">
            The institution will never ask you to disclose your password or a one-time code by telephone, email, message or any other channel —
            a request of that kind is a fraud attempt however convincing it looks.
          </p>
        </div>
      </div>
    </>
  );
}
