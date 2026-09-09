import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { Panel, PanelBody } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, Note } from "../../components/ui/Misc";
import { CREDENTIALS, useApp } from "../../state/AppContext";

export function LoginPage() {
  const { login, recordFailure } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState(CREDENTIALS.customer.user);
  const [pass, setPass] = useState(CREDENTIALS.customer.pass);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function attempt() {
    const u = user.trim();
    const p = pass;
    if (!u || !p) {
      setError("Enter both a user name and a password.");
      return;
    }
    if (u !== CREDENTIALS.customer.user || p !== CREDENTIALS.customer.pass) {
      recordFailure();
      setError(
        `Those credentials do not match the demo user. Use ${CREDENTIALS.customer.user} / ${CREDENTIALS.customer.pass} — both are prefilled and shown below.`
      );
      return;
    }
    setError(null);
    login("customer", "Aditi Sharma");
    navigate("/");
  }

  return (
    <>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-navy-lt to-navy text-white mb-3 shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-[19px] font-bold text-navy mb-1">Welcome back</h1>
        <p className="m-0 text-[12.5px] text-ink-2">Sign in to manage your accounts, transfers and cards.</p>
      </div>

      <Panel className="mb-4">
        <PanelBody>
          {error ? <Note danger className="mb-3.5">{error}</Note> : null}

          <Field label="User name" htmlFor="login-user" className="mb-3.5">
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
              <TextInput
                id="login-user"
                className="pl-9"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="login-pass" className="mb-4">
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
              <TextInput
                id="login-pass"
                type={showPass ? "text" : "password"}
                className="pl-9 pr-9"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter") attempt();
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

          <Btn variant="block" onClick={attempt}>
            Sign In
          </Btn>

          <p className="mt-4 mb-0 text-center text-[12px]">
            <Link to="/admin-login" className="font-semibold text-navy">
              Staff login
            </Link>
          </p>
        </PanelBody>
      </Panel>

      {/* <Callout title="This is a demo — nothing is transmitted" variant="info" className="mb-0">
        <p>
          Demo credentials are pre-filled above (<strong>{CREDENTIALS.customer.user}</strong> / <strong>{CREDENTIALS.customer.pass}</strong>).
          This screen makes no network request — the check runs entirely in your browser.
        </p>
      </Callout> */}
    </>
  );
}
