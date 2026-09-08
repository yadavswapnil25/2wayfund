import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, Select, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Note } from "../../components/ui/Misc";
import { CREDENTIALS, useApp } from "../../state/AppContext";

export function AdminLoginPage() {
  const { login, recordFailure } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState(CREDENTIALS.admin.user);
  const [pass, setPass] = useState(CREDENTIALS.admin.pass);
  const [role, setRole] = useState("Compliance officer");
  const [error, setError] = useState<string | null>(null);

  function attempt() {
    const u = user.trim();
    const p = pass;
    if (!u || !p) {
      setError("Enter both a staff ID and a password.");
      return;
    }
    if (u !== CREDENTIALS.admin.user || p !== CREDENTIALS.admin.pass) {
      recordFailure();
      setError(
        `Those credentials do not match the demo staff account. Use ${CREDENTIALS.admin.user} / ${CREDENTIALS.admin.pass} — both are prefilled and shown below.`
      );
      return;
    }
    setError(null);
    login("admin", role);
    navigate("/console");
  }

  return (
    <Panel className="mb-0">
      <PanelHead title="Staff Login" />
      <PanelBody>
        {error ? <Note danger>{error}</Note> : null}
        <Field label="Staff ID" htmlFor="admin-user" className="mb-3.5">
          <TextInput id="admin-user" value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" spellCheck={false} />
        </Field>
        <Field label="Password" htmlFor="admin-pass" className="mb-3.5">
          <TextInput
            id="admin-pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") attempt();
            }}
          />
        </Field>
        <Field label="Role" htmlFor="admin-role" className="mb-3.5">
          <Select id="admin-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Compliance officer</option>
            <option>Operations</option>
          </Select>
        </Field>
        <div className="flex items-center gap-3 flex-wrap">
          <Btn variant="primary" onClick={attempt}>
            Sign In
          </Btn>
          <Link to="/login" className="text-[12px]">
            Customer login
          </Link>
        </div>
        <p className="mt-3.5 text-xs text-ink-2">Demo credentials are pre-filled above.</p>
      </PanelBody>
    </Panel>
  );
}
