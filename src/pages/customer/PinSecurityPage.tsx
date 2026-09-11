import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { confirmPinChange, confirmPasswordChange, initiatePinChange, initiatePasswordChange } from "../../services/securityService";
import { getMe } from "../../services/meService";
import { ApiError } from "../../services/apiClient";
import { LOGIN_NOTICE_KEY } from "../../data/constants";

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches RegisterAccountPage,
 * ExchangePage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

type Stage = "form" | "otp" | "done";

export function PinSecurityPage() {
  const { store, setStore, session, logout } = useApp();
  const navigate = useNavigate();

  // The shared store only reflects the real, logged-in customer once
  // some page has fetched /me — normally the Account & Passbook page, but
  // a customer can land here first (direct link, bookmark). Refreshing it
  // here too means the PIN status badge is never a stale leftover from
  // whoever was last shown in this browser tab.
  useEffect(() => {
    if (!session.token) return;
    const controller = new AbortController();
    const token = session.token;
    void getMe(token, controller.signal)
      .then((me) => setStore((s) => ({ ...s, user: { ...s.user, ...me } })))
      .catch(() => {
        // Best-effort — the last-known pinStatus stays displayed.
      });
    return () => controller.abort();
  }, [session.token, setStore]);

  const [pinAuth, setPinAuth] = useState("");
  const [pinNew, setPinNew] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinErrors, setPinErrors] = useState<Record<string, string | null>>({});
  const [pinFormError, setPinFormError] = useState<string | null>(null);
  const [pinStage, setPinStage] = useState<Stage>("form");
  const [pinOtpInput, setPinOtpInput] = useState("");
  const [pinOtpError, setPinOtpError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState(false);

  const [pwAuth, setPwAuth] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string | null>>({});
  const [pwFormError, setPwFormError] = useState<string | null>(null);
  const [pwStage, setPwStage] = useState<Stage>("form");
  const [pwOtpInput, setPwOtpInput] = useState("");
  const [pwOtpError, setPwOtpError] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  async function submitPin() {
    if (pinSubmitting) return;
    const errs: Record<string, string | null> = {};
    if (!pinAuth) errs.auth = "Enter your current password or 8-digit secure code.";
    if (!/^\d{9}$/.test(pinNew)) errs.new = "Enter exactly 9 numeric digits.";
    if (!pinConfirm) errs.confirm = "Re-enter the 9-digit PIN.";
    else if (pinConfirm !== pinNew) errs.confirm = "PINs do not match.";
    setPinErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (!session.token) {
      setPinFormError("Your session has no API token — sign out and sign back in.");
      return;
    }

    setPinFormError(null);
    setPinSubmitting(true);
    try {
      await initiatePinChange({ currentCredential: pinAuth, newPin: pinNew, newPinConfirmation: pinConfirm }, session.token);
      setPinStage("otp");
      setPinOtpInput("");
      setPinOtpError(null);
    } catch (err) {
      setPinFormError(firstErrorMessage(err, "Could not start the PIN change. Please try again."));
    } finally {
      setPinSubmitting(false);
    }
  }

  async function confirmPinOtp() {
    if (pinSubmitting || !session.token) return;
    if (!/^\d{6}$/.test(pinOtpInput)) {
      setPinOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setPinOtpError(null);
    setPinSubmitting(true);
    try {
      await confirmPinChange(pinOtpInput, session.token);
      setStore((s) => ({ ...s, user: { ...s.user, pinStatus: "Active" } }));
      setPinStage("done");
      setPinAuth("");
      setPinNew("");
      setPinConfirm("");
    } catch (err) {
      setPinOtpError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
    } finally {
      setPinSubmitting(false);
    }
  }

  async function submitPw() {
    if (pwSubmitting) return;
    const errs: Record<string, string | null> = {};
    if (!pwAuth) errs.auth = "Enter your current password or 8-digit secure code.";
    if (pwNew.length < 8) errs.new = "Password must be at least 8 characters.";
    if (!pwConfirm) errs.confirm = "Re-enter the new password.";
    else if (pwConfirm !== pwNew) errs.confirm = "Passwords do not match.";
    setPwErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    if (!session.token) {
      setPwFormError("Your session has no API token — sign out and sign back in.");
      return;
    }

    setPwFormError(null);
    setPwSubmitting(true);
    try {
      await initiatePasswordChange({ currentCredential: pwAuth, newPassword: pwNew, newPasswordConfirmation: pwConfirm }, session.token);
      setPwStage("otp");
      setPwOtpInput("");
      setPwOtpError(null);
    } catch (err) {
      setPwFormError(firstErrorMessage(err, "Could not start the password change. Please try again."));
    } finally {
      setPwSubmitting(false);
    }
  }

  async function confirmPwOtp() {
    if (pwSubmitting || !session.token) return;
    if (!/^\d{6}$/.test(pwOtpInput)) {
      setPwOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setPwOtpError(null);
    setPwSubmitting(true);
    try {
      await confirmPasswordChange(pwOtpInput, session.token);
      // The password just changed, so this session's credentials are
      // stale by definition — sign out and send the customer back to
      // login to prove the new one actually works, the same way a real
      // bank forces re-authentication after a credential change. The
      // notice travels via sessionStorage rather than router state: this
      // page is customer-only, so the moment logout() clears the session,
      // RouteGuard's own protective redirect fires a competing, state-less
      // navigation to "/login" that otherwise wins the race.
      try {
        sessionStorage.setItem(LOGIN_NOTICE_KEY, "Your NetBanking password has been changed. Please sign in with your new password.");
      } catch {
        // sessionStorage can throw (private browsing, disabled storage) —
        // the customer still gets signed out and redirected either way.
      }
      navigate("/login");
      logout();
    } catch (err) {
      setPwOtpError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
      setPwSubmitting(false);
    }
  }

  const active = store.user.pinStatus === "Active";

  return (
    <>
      <PageHead
        title="9-Digit PIN & Security"
        lede="Set or update the transaction PIN required before any interbank or internal fund transfer, and change the password used to sign in to NetBanking."
      />

      <div className="grid gap-5 mb-5 items-start min-[1001px]:grid-cols-2">
        {/* PIN setup */}
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#FBF4E1] text-amber flex items-center justify-center">
              <KeyRound size={18} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">9-Digit Transaction PIN Setup</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Required before any interbank or internal transfer</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-3 mb-4">
              <span className="text-[10.5px] uppercase text-ink-2 font-semibold">Transaction PIN status</span>
              <div className="flex items-center justify-between mt-1">
                <strong className="text-sm text-navy">{active ? "Active & Configured" : "Not configured"}</strong>
                <Tag variant={active ? "completed" : "review"}>{active ? "Enabled" : "Disabled"}</Tag>
              </div>
            </div>

            {pinFormError ? <Note danger>{pinFormError}</Note> : null}
            {pinStage === "done" ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Transaction PIN set</h3>
                <p className="m-0 text-xs mb-2.5">
                  Your 9-digit transaction PIN has been set and activated. Use it wherever the transfer flow calls for a transaction password.
                </p>
                <button type="button" onClick={() => setPinStage("form")} className="text-xs font-semibold text-navy underline">
                  Set a different PIN
                </button>
              </div>
            ) : null}

            {pinStage === "form" ? (
              <FormGrid>
                <Field label="Current password or 8-digit secure code" required wide error={pinErrors.auth}>
                  <TextInput type="password" value={pinAuth} onChange={(e) => setPinAuth(e.target.value)} hasError={!!pinErrors.auth} />
                </Field>
                <Field
                  label="New 9-digit transaction PIN"
                  required
                  wide
                  error={pinErrors.new}
                  hint={!pinErrors.new ? `Must be exactly 9 numeric digits. Digits: ${pinNew.length}/9` : undefined}
                >
                  <TextInput
                    type="password"
                    inputMode="numeric"
                    maxLength={9}
                    value={pinNew}
                    onChange={(e) => setPinNew(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
                    placeholder="9 numeric digits (e.g. 984018274)"
                    hasError={!!pinErrors.new}
                  />
                </Field>
                <Field label="Confirm new 9-digit PIN" required wide error={pinErrors.confirm}>
                  <TextInput
                    type="password"
                    inputMode="numeric"
                    maxLength={9}
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/[^0-9]/g, "").slice(0, 9))}
                    placeholder="Re-enter 9 numeric digits"
                    hasError={!!pinErrors.confirm}
                  />
                </Field>
                <FormActions className="flex-col items-stretch">
                  <Btn variant="block" onClick={() => void submitPin()} disabled={pinSubmitting}>
                    {pinSubmitting ? "Sending code…" : "Set & Activate 9-Digit Transaction PIN"}
                  </Btn>
                  <Note className="!m-0">A one-time code will be emailed to the address on file before this takes effect.</Note>
                </FormActions>
              </FormGrid>
            ) : null}

            {pinStage === "otp" ? (
              <OtpBox
                otpInput={pinOtpInput}
                setOtpInput={setPinOtpInput}
                error={pinOtpError}
                submitting={pinSubmitting}
                onConfirm={() => void confirmPinOtp()}
                onCancel={() => setPinStage("form")}
              />
            ) : null}
          </div>
        </div>

        {/* Password change */}
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
              <Lock size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">Change NetBanking Password</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Used to sign in to your account</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            {pwFormError ? <Note danger>{pwFormError}</Note> : null}

            {pwStage === "form" ? (
              <FormGrid>
                <Field label="Current password or 8-digit secure code" required wide error={pwErrors.auth}>
                  <TextInput type="password" value={pwAuth} onChange={(e) => setPwAuth(e.target.value)} hasError={!!pwErrors.auth} />
                </Field>
                <Field label="New password" required wide error={pwErrors.new} hint={!pwErrors.new ? "Minimum 8 characters" : undefined}>
                  <TextInput type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} hasError={!!pwErrors.new} />
                </Field>
                <Field label="Confirm new password" required wide error={pwErrors.confirm}>
                  <TextInput type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} hasError={!!pwErrors.confirm} />
                </Field>
                <FormActions className="flex-col items-stretch">
                  <Btn variant="block" onClick={() => void submitPw()} disabled={pwSubmitting}>
                    {pwSubmitting ? "Sending code…" : "Update NetBanking Password"}
                  </Btn>
                  <Note className="!m-0">A one-time code will be emailed to the address on file before this takes effect.</Note>
                </FormActions>
              </FormGrid>
            ) : null}

            {pwStage === "otp" ? (
              <OtpBox
                otpInput={pwOtpInput}
                setOtpInput={setPwOtpInput}
                error={pwOtpError}
                submitting={pwSubmitting}
                onConfirm={() => void confirmPwOtp()}
                onCancel={() => setPwStage("form")}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Security advisory */}
      <div className="rounded-2xl border border-[#DDC98B] bg-[#FBF4E1] px-4.5 sm:px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={15} className="text-amber" />
          <h3 className="m-0 text-[13px] font-bold text-navy">On the 8-Digit Secure Code</h3>
        </div>
        <p className="text-[12.5px] leading-relaxed m-0 text-ink">
          The institution will never ask you to disclose your password, transaction PIN, secure code or a one-time code — by telephone, email,
          message or any other channel — and will never ask you to make a payment to reset or unlock either credential. A request of that kind is
          a fraud attempt however convincing it looks.
        </p>
      </div>
    </>
  );
}

function OtpBox({
  otpInput,
  setOtpInput,
  error,
  submitting,
  onConfirm,
  onCancel,
}: {
  otpInput: string;
  setOtpInput: (v: string) => void;
  error: string | null;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-tint border border-border-lt rounded-xl p-4 mt-4 text-[12.5px]">
      <span className="block font-bold text-navy mb-2">Enter the one-time code we emailed you</span>
      <div>Check the email on file for this account — the code expires 10 minutes after it's sent, and can only be used once.</div>
      <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
        <input
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => e.key === "Enter" && onConfirm()}
          inputMode="numeric"
          autoComplete="off"
          className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-lg"
          aria-label="One-time code"
        />
        <Btn variant="approve" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Confirming…" : "Confirm"}
        </Btn>
        <Btn onClick={onCancel} disabled={submitting}>
          Cancel
        </Btn>
      </div>
      {error ? <div className="text-neg text-xs font-semibold mt-2.5">{error}</div> : null}
    </div>
  );
}
