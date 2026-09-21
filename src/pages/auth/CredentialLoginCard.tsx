import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Eye, EyeOff, IdCard, Lock, ShieldCheck, type LucideIcon } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { ApiError } from "../../services/apiClient";
import {
  login as apiLogin,
  verifyLoginPin,
  initiateSecurityPinRecovery,
  confirmSecurityPinRecovery,
} from "../../services/authService";
import { takeLoginNotice } from "../../lib/loginNotice";

interface CredentialLoginCardProps {
  icon: LucideIcon;
  accentClass: string;
  title: string;
  subtitle: string;
  idPrefix: string;
  redirectTo: string;
  footer: ReactNode;
}

/** The envelope's own message is a generic "Validation failed" — the
 * useful, specific reason is nested under the offending field instead
 * (matches AdminLoginPage's loginErrorMessage). */
function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return "Something went wrong. Please try again.";
}

/**
 * Shared shell for the customer-facing login screens (Internet Banking and
 * Corporate Internet Banking) — same Customer ID + password fields and the
 * same real backend login underneath (the app models one customer role,
 * not a distinct corporate one), differing only in branding and where a
 * successful sign-in lands.
 */
export function CredentialLoginCard({
  icon: Icon,
  accentClass,
  title,
  subtitle,
  idPrefix,
  redirectTo,
  footer,
}: CredentialLoginCardProps) {
  const { login, recordFailure } = useApp();
  const navigate = useNavigate();
  const [notice] = useState(takeLoginNotice);
  const [customerId, setCustomerId] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Only reached for an account with an active Security PIN — everyone
  // else's attempt() resolves in one step, exactly as before this
  // existed. challenge proves the password step already succeeded; nothing
  // is actually logged in until verifyPin() succeeds.
  const [pinStage, setPinStage] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState(false);

  // "Forgot Security PIN?" — only reachable from the PIN step above,
  // since it needs the password to already have succeeded. Proves
  // identity a different way (account number + Aadhaar, then an emailed
  // code) instead of the forgotten PIN; success signs the customer in
  // and turns the Security PIN off, same as the backend does.
  const [recoveryStage, setRecoveryStage] = useState<"closed" | "form" | "otp">("closed");
  const [recoveryAccountNumber, setRecoveryAccountNumber] = useState("");
  const [recoveryAadhaar, setRecoveryAadhaar] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  async function attempt() {
    if (submitting) return;

    const id = customerId.trim();
    if (!id || !pass) {
      setError("Enter both your Customer ID and password.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await apiLogin(id, pass);

      if (result.pinRequired) {
        setChallenge(result.challenge);
        setPinStage(true);
        return;
      }

      if (result.user.role !== "customer") {
        recordFailure();
        setError("This is a staff account — use Staff Log In instead.");
        return;
      }

      login("customer", result.user.name, result.token);
      navigate(redirectTo);
    } catch (err) {
      recordFailure();
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function cancelPinStage() {
    setPinStage(false);
    setChallenge(null);
    setPinInput("");
    setPinError(null);
    setPass("");
    cancelRecovery();
  }

  async function verifyPin() {
    if (pinSubmitting || !challenge) return;
    if (!/^\d{6}$/.test(pinInput)) {
      setPinError("Enter your 6-digit Security PIN.");
      return;
    }

    setPinError(null);
    setPinSubmitting(true);
    try {
      const result = await verifyLoginPin(customerId.trim(), challenge, pinInput);

      if (result.user.role !== "customer") {
        recordFailure();
        setPinError("This is a staff account — use Staff Log In instead.");
        return;
      }

      login("customer", result.user.name, result.token);
      navigate(redirectTo);
    } catch (err) {
      recordFailure();
      setPinError(loginErrorMessage(err));
    } finally {
      setPinSubmitting(false);
    }
  }

  function openRecovery() {
    setRecoveryStage("form");
    setRecoveryAccountNumber("");
    setRecoveryAadhaar("");
    setRecoveryOtp("");
    setRecoveryError(null);
  }

  function cancelRecovery() {
    setRecoveryStage("closed");
    setRecoveryAccountNumber("");
    setRecoveryAadhaar("");
    setRecoveryOtp("");
    setRecoveryError(null);
  }

  async function submitRecovery() {
    if (recoverySubmitting) return;
    const accountNumber = recoveryAccountNumber.trim();
    const aadhaar = recoveryAadhaar.trim();
    if (!accountNumber || !aadhaar) {
      setRecoveryError("Enter both your account number and Aadhaar number.");
      return;
    }

    setRecoveryError(null);
    setRecoverySubmitting(true);
    try {
      await initiateSecurityPinRecovery(accountNumber, aadhaar);
      setRecoveryStage("otp");
      setRecoveryOtp("");
    } catch (err) {
      setRecoveryError(loginErrorMessage(err));
    } finally {
      setRecoverySubmitting(false);
    }
  }

  async function confirmRecoveryOtp() {
    if (recoverySubmitting) return;
    if (!/^\d{6}$/.test(recoveryOtp)) {
      setRecoveryError("Enter the 6-digit code from your email.");
      return;
    }

    setRecoveryError(null);
    setRecoverySubmitting(true);
    try {
      const result = await confirmSecurityPinRecovery(recoveryAccountNumber.trim(), recoveryOtp);

      if (result.user.role !== "customer") {
        recordFailure();
        setRecoveryError("This is a staff account — use Staff Log In instead.");
        return;
      }

      login("customer", result.user.name, result.token);
      navigate(redirectTo);
    } catch (err) {
      recordFailure();
      setRecoveryError(loginErrorMessage(err));
    } finally {
      setRecoverySubmitting(false);
    }
  }

  return (
    <Panel className="mb-4 overflow-hidden">
      <div className={`text-center px-5 pt-6 pb-5 text-white ${accentClass}`}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 border border-white/30 mb-3">
          <Icon size={24} />
        </div>
        <h1 className="text-white! text-[19px] font-bold mb-1">{title}</h1>
        <p className="m-0 text-[12.5px] text-white/85">{subtitle}</p>
      </div>

      <PanelBody>
        {notice ? (
          <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-3.5 mb-3.5 text-[12.5px] text-ink">{notice}</div>
        ) : null}

        {pinStage && recoveryStage !== "closed" ? (
          <>
            {recoveryError ? <Note danger className="mb-3.5">{recoveryError}</Note> : null}

            {recoveryStage === "form" ? (
              <>
                <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-3 mb-3.5">
                  <p className="m-0 text-[12px] text-ink">
                    Verify your identity with your account number and Aadhaar number — we'll email a one-time code to confirm it's you. This
                    turns your Security PIN off; you can set a new one after signing in.
                  </p>
                </div>

                <Field label="Account number" htmlFor={`${idPrefix}-recovery-account`} className="mb-3.5">
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                    <TextInput
                      id={`${idPrefix}-recovery-account`}
                      className="pl-9"
                      value={recoveryAccountNumber}
                      onChange={(e) => setRecoveryAccountNumber(e.target.value)}
                      placeholder="e.g. 410079004817"
                      autoComplete="off"
                    />
                  </div>
                </Field>

                <Field label="Aadhaar number" htmlFor={`${idPrefix}-recovery-aadhaar`} className="mb-4">
                  <TextInput
                    id={`${idPrefix}-recovery-aadhaar`}
                    value={recoveryAadhaar}
                    onChange={(e) => setRecoveryAadhaar(e.target.value)}
                    placeholder="e.g. 234567890123"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submitRecovery();
                    }}
                  />
                </Field>

                <Btn variant="block" onClick={() => void submitRecovery()} disabled={recoverySubmitting}>
                  {recoverySubmitting ? "Sending code…" : "Send Recovery Code"}
                </Btn>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-border-lt bg-tint px-3.5 py-3 mb-3.5">
                  <p className="m-0 text-[12px] text-ink">
                    Enter the 6-digit code emailed to the address on file. It expires 10 minutes after it's sent, and can only be used once.
                  </p>
                </div>

                <Field label="Recovery code" htmlFor={`${idPrefix}-recovery-otp`} className="mb-4">
                  <TextInput
                    id={`${idPrefix}-recovery-otp`}
                    inputMode="numeric"
                    maxLength={6}
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6 digits"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void confirmRecoveryOtp();
                    }}
                  />
                </Field>

                <Btn variant="block" onClick={() => void confirmRecoveryOtp()} disabled={recoverySubmitting}>
                  {recoverySubmitting ? "Verifying…" : "Verify & Log In"}
                </Btn>
              </>
            )}

            <p className="mt-3 mb-0 text-center text-[12px]">
              <button type="button" onClick={cancelRecovery} className="font-semibold text-ink-2 underline">
                Back to Security PIN
              </button>
            </p>
          </>
        ) : pinStage ? (
          <>
            {pinError ? <Note danger className="mb-3.5">{pinError}</Note> : null}

            <div className="flex items-center gap-2.5 rounded-xl border border-border-lt bg-tint px-3.5 py-3 mb-3.5">
              <span className="flex-none w-9 h-9 rounded-full bg-[#EAF1F9] text-navy flex items-center justify-center">
                <ShieldCheck size={16} />
              </span>
              <p className="m-0 text-[12px] text-ink">
                Enter your 6-digit <strong>Security PIN</strong> to finish signing in to <strong>{customerId.trim()}</strong>.
              </p>
            </div>

            <Field label="Security PIN" htmlFor={`${idPrefix}-security-pin`} className="mb-4">
              <TextInput
                id={`${idPrefix}-security-pin`}
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6 digits"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void verifyPin();
                }}
              />
            </Field>

            <Btn variant="block" onClick={() => void verifyPin()} disabled={pinSubmitting}>
              {pinSubmitting ? "Verifying…" : "Verify & Log In"}
            </Btn>

            <p className="mt-3 mb-0 flex items-center justify-center gap-3 text-[12px]">
              <button type="button" onClick={openRecovery} className="font-semibold text-navy underline">
                Forgot Security PIN?
              </button>
              <button type="button" onClick={cancelPinStage} className="font-semibold text-ink-2 underline">
                Use a different account
              </button>
            </p>
          </>
        ) : (
          <>
            {error ? <Note danger className="mb-3.5">{error}</Note> : null}

            <Field label="Customer ID" htmlFor={`${idPrefix}-id`} className="mb-3.5">
              <div className="relative">
                <IdCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                <TextInput
                  id={`${idPrefix}-id`}
                  className="pl-9"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="e.g. 2WFMP04817"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </Field>

            <Field label="Password" htmlFor={`${idPrefix}-pass`} className="mb-4">
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                <TextInput
                  id={`${idPrefix}-pass`}
                  type={showPass ? "text" : "password"}
                  className="pl-9 pr-9"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void attempt();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 hover:text-navy"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <Btn variant="block" onClick={() => void attempt()} disabled={submitting}>
              {submitting ? "Logging in…" : "Log In"}
            </Btn>

            {footer}
          </>
        )}
      </PanelBody>
    </Panel>
  );
}
