import { useState, type ComponentType } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, CheckCircle2, Eye, EyeOff, KeyRound, Lock, ShieldAlert, X } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, Note } from "../../components/ui/Misc";
import { ApiError } from "../../services/apiClient";
import { setPassword } from "../../services/authService";

const MIN_PASSWORD_LENGTH = 8;

function Banner({
  icon: Icon,
  accentClass,
  title,
  subtitle,
}: {
  icon: ComponentType<{ size?: number }>;
  accentClass: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className={`text-center px-5 pt-6 pb-5 text-white ${accentClass}`}>
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 border border-white/30 mb-3">
        <Icon size={24} />
      </div>
      <h1 className="text-white! text-[19px] font-bold mb-1">{title}</h1>
      <p className="m-0 text-[12.5px] text-white/85">{subtitle}</p>
    </div>
  );
}

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
      <Panel className="mb-4 overflow-hidden">
        <Banner
          icon={ShieldAlert}
          accentClass="bg-gradient-to-b from-[#B8541F] to-[#8F3F15]"
          title="Link Incomplete"
          subtitle="This page needs an email and a one-time token to continue."
        />
        <PanelBody>
          <Callout title="Check your approval email" variant="warn">
            <p>
              This link needs an email and a one-time token — check the link in your inbox, or ask us to resend it if it's no longer
              there.
            </p>
          </Callout>
          <p className="m-0 mt-3.5 text-center text-[12px]">
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
      <Panel className="mb-4 overflow-hidden">
        <Banner
          icon={CheckCircle2}
          accentClass="bg-gradient-to-b from-[#2C9159] to-[#1C7A46]"
          title="Password Set"
          subtitle={`Your account is ready. Sign in with ${email} and the password you just chose.`}
        />
        <PanelBody className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white no-underline hover:brightness-110"
          >
            Continue to Sign In →
          </Link>
        </PanelBody>
      </Panel>
    );
  }

  const lengthOk = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <Panel className="mb-4 overflow-hidden">
      <Banner
        icon={KeyRound}
        accentClass="bg-gradient-to-b from-navy-lt to-navy"
        title="Set Your Password"
        subtitle={`Choose a password for ${email} to finish setting up your account.`}
      />
      <PanelBody>
        {error ? (
          <Callout title="Couldn't set your password" variant="warn" className="mb-3.5">
            <p>{error}</p>
          </Callout>
        ) : null}

        <Field label="New password" htmlFor="sp-password" className="mb-1">
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
        <p className={`m-0 mb-3.5 flex items-center gap-1 text-[11px] ${lengthOk ? "text-pos font-semibold" : "text-ink-2"}`}>
          {lengthOk ? <Check size={12} /> : null}
          {lengthOk ? "Long enough" : `At least ${MIN_PASSWORD_LENGTH} characters (${password.length}/${MIN_PASSWORD_LENGTH})`}
        </p>

        <Field label="Confirm password" htmlFor="sp-confirm" className="mb-1">
          <TextInput
            id="sp-confirm"
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            hasError={passwordsMismatch}
            autoComplete="new-password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <p className={`m-0 mb-4 flex items-center gap-1 text-[11px] ${confirm.length === 0 ? "invisible" : passwordsMatch ? "text-pos font-semibold" : "text-neg font-semibold"}`}>
          {passwordsMatch ? <Check size={12} /> : <X size={12} />}
          {passwordsMatch ? "Passwords match" : "Passwords don't match yet"}
        </p>

        <Btn variant="block" onClick={submit} disabled={submitting}>
          {submitting ? "Setting password…" : "Set password"}
        </Btn>

        <Note className="mt-3 text-center">This link expires 60 minutes after your application was approved and can only be used once.</Note>
      </PanelBody>
    </Panel>
  );
}
