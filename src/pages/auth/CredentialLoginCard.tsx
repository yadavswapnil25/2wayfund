import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, IdCard, Lock, type LucideIcon } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { ApiError } from "../../services/apiClient";
import { login as apiLogin } from "../../services/authService";
import { LOGIN_NOTICE_KEY } from "../../data/constants";

/** Read-and-clear: a notice set by a page that signed the customer out on
 * purpose (e.g. right after a password change) should only ever show
 * once, on the very next login screen — not linger for a later, unrelated
 * sign-in in the same tab. */
function takeLoginNotice(): string | null {
  try {
    const notice = sessionStorage.getItem(LOGIN_NOTICE_KEY);
    if (notice) sessionStorage.removeItem(LOGIN_NOTICE_KEY);
    return notice;
  } catch {
    return null;
  }
}

const DEMO_CUSTOMER_ID = "2WFMP04817";
const DEMO_PASSWORD = "demo1234";

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
  const [customerId, setCustomerId] = useState(DEMO_CUSTOMER_ID);
  const [pass, setPass] = useState(DEMO_PASSWORD);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

      if (result.user.role !== "customer") {
        recordFailure();
        setError("This is a staff account — use Staff Sign In instead.");
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
        {error ? <Note danger className="mb-3.5">{error}</Note> : null}

        <Field label="Customer ID" htmlFor={`${idPrefix}-id`} className="mb-3.5">
          <div className="relative">
            <IdCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
            <TextInput
              id={`${idPrefix}-id`}
              className="pl-9"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
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
          {submitting ? "Signing in…" : "Sign In"}
        </Btn>

        {footer}
      </PanelBody>
    </Panel>
  );
}
