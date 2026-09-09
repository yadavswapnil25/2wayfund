import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, Note } from "../../components/ui/Misc";
import { ApiError } from "../../services/apiClient";
import { setPassword } from "../../services/authService";

const MIN_PASSWORD_LENGTH = 12;

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!email || !token) {
    return (
      <Panel className="mb-4">
        <PanelBody>
          <Callout title="This link is incomplete" variant="warn">
            <p>
              This page needs an email and a one-time token from your approval email — check the link in your inbox, or ask us to resend
              it if it's no longer there.
            </p>
          </Callout>
          <p className="m-0 text-center text-[12px]">
            <Link to="/login" className="font-semibold text-navy">
              Back to sign in
            </Link>
          </p>
        </PanelBody>
      </Panel>
    );
  }

  async function submit() {
    if (submitting) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await setPassword({ email: email!, token: token!, password, passwordConfirmation: confirm });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-2xl px-4.5 sm:px-5 py-5 mb-5">
        <h3 className="text-pos font-bold mb-3 text-[15px]">Your password is set</h3>
        <p className="text-[12.5px] text-ink mb-3">
          Your account is ready. Sign in with <strong>{email}</strong> and the password you just chose.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white no-underline hover:brightness-110"
        >
          Continue to Sign In →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-navy-lt to-navy text-white mb-3 shadow-sm">
          <KeyRound size={24} />
        </div>
        <h1 className="text-[19px] font-bold text-navy mb-1">Set your password</h1>
        <p className="m-0 text-[12.5px] text-ink-2">
          Choose a password for <strong>{email}</strong> to finish setting up your account.
        </p>
      </div>

      <Panel className="mb-4">
        <PanelBody>
          {error ? (
            <div className="mb-3.5">
              <Callout title="Couldn't set your password" variant="warn">
                <p>{error}</p>
              </Callout>
            </div>
          ) : null}

          <Field label="New password" htmlFor="sp-password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} className="mb-3.5">
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
              <TextInput
                id="sp-password"
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-9"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 hover:text-navy"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm password" htmlFor="sp-confirm" className="mb-4">
            <TextInput
              id="sp-confirm"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>

          <Btn variant="block" onClick={submit} disabled={submitting}>
            {submitting ? "Setting password…" : "Set password"}
          </Btn>

          <Note className="mt-3 text-center">This link expires 60 minutes after your application was approved and can only be used once.</Note>
        </PanelBody>
      </Panel>
    </>
  );
}
