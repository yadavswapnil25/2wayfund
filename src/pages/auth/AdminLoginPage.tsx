import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import { ApiError } from "../../services/apiClient";
import { login as apiLogin } from "../../services/authService";

const DEMO_EMAIL = "admin@2wayfund.org";
const DEMO_PASSWORD = "admin1234";

/** The envelope's own message is a generic "Validation failed" — the
 * useful, specific reason (e.g. "The provided credentials are incorrect.")
 * is nested under the offending field instead. */
function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return "Something went wrong. Please try again.";
}

export function AdminLoginPage() {
  const { login, recordFailure } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [pass, setPass] = useState(DEMO_PASSWORD);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function attempt() {
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !pass) {
      setError("Enter both a work email and a password.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await apiLogin(trimmedEmail, pass);

      if (result.user.role !== "admin") {
        recordFailure();
        setError("This account does not have staff access. Use a Compliance or Operations login instead.");
        return;
      }

      login("admin", result.user.staff_role ? `${result.user.name} — ${result.user.staff_role}` : result.user.name, result.token);
      navigate("/console");
    } catch (err) {
      recordFailure();
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-navy-lt to-navy text-white mb-3 shadow-sm">
          <Building2 size={24} />
        </div>
        <h1 className="text-[19px] font-bold text-navy mb-1">Staff Sign In</h1>
        <p className="m-0 text-[12.5px] text-ink-2">Back-office access for compliance and operations.</p>
      </div>

      <Panel className="mb-4">
        <PanelBody>
          {error ? <Note danger className="mb-3.5">{error}</Note> : null}

          <Field label="Work email" htmlFor="admin-email" className="mb-3.5">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
              <TextInput
                id="admin-email"
                type="email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="admin-pass" className="mb-4">
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
              <TextInput
                id="admin-pass"
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

          <p className="mt-4 mb-0 text-center text-[12px]">
            <Link to="/login" className="font-semibold text-navy">
              Customer login
            </Link>
          </p>
        </PanelBody>
      </Panel>
    </>
  );
}
