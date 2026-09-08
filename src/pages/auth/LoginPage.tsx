import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { CREDENTIALS, useApp } from "../../state/AppContext";

export function LoginPage() {
  const { login, recordFailure } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState(CREDENTIALS.customer.user);
  const [pass, setPass] = useState(CREDENTIALS.customer.pass);
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
    <Panel className="mb-0">
      <PanelHead title="Customer Login" />
      <PanelBody>
        {error ? <Note danger>{error}</Note> : null}
        <Field label="User name" htmlFor="login-user" className="mb-3.5">
          <TextInput id="login-user" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" spellCheck={false} />
        </Field>
        <Field label="Password" htmlFor="login-pass" className="mb-3.5">
          <TextInput
            id="login-pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") attempt();
            }}
          />
        </Field>
        <div className="flex items-center gap-3 flex-wrap">
          <Btn variant="primary" onClick={attempt}>
            Sign In
          </Btn>
          <Link to="/admin-login" className="text-[12px]">
            Staff login
          </Link>
        </div>
        <p className="mt-3.5 text-xs text-ink-2">
          Demo credentials are pre-filled above. This screen makes no network request — the check runs entirely in your browser.
        </p>
      </PanelBody>
    </Panel>
  );
}
