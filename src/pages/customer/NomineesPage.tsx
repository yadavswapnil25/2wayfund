import { useState } from "react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Field, FormActions, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout, Chip, Note } from "../../components/ui/Misc";
import { DirectoryCard, DirectoryEmpty, DirectoryList } from "../../components/ui/DirectoryCard";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import type { Nominee } from "../../types/data";
import { ageOn, stamp, todayIso } from "../../lib/dates";

function isMinorDob(dob: string): boolean {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  if (dob > todayIso()) return false;
  return ageOn(dob, todayIso()) < 18;
}

export function NomineesPage() {
  const { store, setStore } = useApp();
  const existing = store.nominees[0] ?? null;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState(store.nomineeRelationships[0]);
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [pending, setPending] = useState<Nominee | null>(null);
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const minor = isMinorDob(dob);
  const blocked = store.nominees.length > 0 && !editingId;

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function clearForm() {
    setEditingId(null);
    setName(""); setRelationship(store.nomineeRelationships[0]); setDob(""); setAddress("");
    setGuardianName(""); setGuardianRelationship(""); setGuardianAddress("");
    setErrors({});
    setPending(null);
    setOtp(""); setOtpInput(""); setOtpError(null);
  }

  function startEdit(nm: Nominee) {
    setEditingId(nm.id);
    setName(nm.name); setRelationship(nm.relationship); setDob(nm.dob); setAddress(nm.address);
    setGuardianName(nm.guardianName); setGuardianRelationship(nm.guardianRelationship); setGuardianAddress(nm.guardianAddress);
    setErrors({});
    setPending(null);
  }

  function removeNominee(id: string) {
    setStore((s) => ({
      ...s,
      nominees: s.nominees.filter((n) => n.id !== id),
      nomineeAudit: [{ at: stamp(), action: `Nomination cancelled — ${s.nominees.find((n) => n.id === id)?.name} (${s.nominees.find((n) => n.id === id)?.relationship})` }, ...s.nomineeAudit],
    }));
    if (editingId === id) clearForm();
  }

  function validate(): boolean {
    let ok = true;
    if (!name.trim()) { setErr("nf-name", "Enter the nominee’s name."); ok = false; } else setErr("nf-name", null);
    if (!address.trim()) { setErr("nf-address", "Enter the nominee’s address."); ok = false; } else setErr("nf-address", null);

    if (!dob) { setErr("nf-dob", "Enter a date of birth."); ok = false; }
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) { setErr("nf-dob", "Enter a valid date."); ok = false; }
    else if (dob > todayIso()) { setErr("nf-dob", "Date of birth cannot be in the future."); ok = false; }
    else setErr("nf-dob", null);

    if (isMinorDob(dob)) {
      if (!guardianName.trim()) { setErr("nf-gname", "A guardian must be named for a nominee under 18."); ok = false; } else setErr("nf-gname", null);
      if (!guardianRelationship.trim()) { setErr("nf-grel", "State the guardian’s relationship to the nominee."); ok = false; } else setErr("nf-grel", null);
      if (!guardianAddress.trim()) { setErr("nf-gaddress", "Enter the guardian’s address."); ok = false; } else setErr("nf-gaddress", null);
    }

    return ok;
  }

  function submit() {
    if (!validate()) return;
    const rec: Nominee = {
      id: editingId || "nom" + (store.nominees.length + 1 + Math.floor(Math.random() * 1000)),
      name: name.trim(),
      relationship,
      dob,
      address: address.trim(),
      guardianName: minor ? guardianName.trim() : "",
      guardianRelationship: minor ? guardianRelationship.trim() : "",
      guardianAddress: minor ? guardianAddress.trim() : "",
      registered: stamp(),
    };
    setPending(rec);
    setOtp(String(Math.floor(100000 + Math.random() * 900000)));
    setOtpInput("");
    setOtpError(null);
  }

  function confirmOtp() {
    if (otpInput.trim() !== otp) {
      setOtpError("Incorrect one-time password. The code is shown above.");
      return;
    }
    if (!pending) return;
    const wasEditing = Boolean(editingId);
    setStore((s) => ({
      ...s,
      nominees: wasEditing ? s.nominees.map((n) => (n.id === pending.id ? pending : n)) : [pending],
      nomineeAudit: [
        { at: stamp(), action: wasEditing ? `Nomination updated — ${pending.name} (${pending.relationship})` : `Nominee registered — ${pending.name} (${pending.relationship})${minor ? `, guardian ${pending.guardianName}` : ""}` },
        ...s.nomineeAudit,
      ],
    }));
    setConfirmMsg(`${pending.name} is now registered as your nominee.`);
    clearForm();
  }

  return (
    <>
      <PageHead
        title="Nomination"
        lede="Register who receives the balance on your accounts. Nomination applies across the whole relationship, and only one nominee can be registered at a time."
      />

      <div className="grid gap-4.5 mb-4 items-stretch min-[1001px]:grid-cols-2">
        <Panel className="mb-0 flex flex-col">
          <PanelHead title={editingId ? `Update Nominee — ${name}` : "Add a Nominee"} note="Confirmation required" />
          <PanelBody>
            <p className="mt-0 text-xs text-ink-2 mb-3">
              Register the person who will receive your account balance. Only one nominee can be registered on this relationship at a time.
            </p>
            {confirmMsg ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-lg p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Nominee registered</h3>
                <p className="m-0 text-xs">{confirmMsg}</p>
              </div>
            ) : null}

            {blocked ? (
              <Callout title="One nominee already registered">
                <p>This relationship allows only one nominee at a time. Edit the existing nominee in the directory, or remove it first to register someone else.</p>
              </Callout>
            ) : (
              <>
                <p className="text-[10.5px] uppercase text-ink-2 font-semibold mb-2">Quick relationship presets</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {store.nomineeRelationships.map((r) => (
                    <Chip key={r} active={relationship === r} onClick={() => setRelationship(r)}>
                      {r}
                    </Chip>
                  ))}
                </div>

                <FormGrid>
                  <Field label="Nominee name" required error={errors["nf-name"]}>
                    <TextInput value={name} onChange={(e) => setName(e.target.value)} maxLength={70} hasError={!!errors["nf-name"]} />
                  </Field>
                  <Field label="Relationship">
                    <Select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                      {store.nomineeRelationships.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Date of birth" required error={errors["nf-dob"]} hint="A nominee under 18 requires a guardian.">
                    <TextInput type="date" value={dob} max={todayIso()} onChange={(e) => setDob(e.target.value)} hasError={!!errors["nf-dob"]} />
                  </Field>
                  <Field label="Nominee address" required wide error={errors["nf-address"]}>
                    <TextArea value={address} onChange={(e) => setAddress(e.target.value)} maxLength={220} style={{ minHeight: 66 }} hasError={!!errors["nf-address"]} />
                  </Field>

                  {minor ? (
                    <>
                      <div className="col-span-2">
                        <p className="m-0 text-xs text-ink-2 font-semibold">Guardian — required for a nominee under 18</p>
                      </div>
                      <Field label="Guardian name" required error={errors["nf-gname"]}>
                        <TextInput value={guardianName} onChange={(e) => setGuardianName(e.target.value)} maxLength={70} hasError={!!errors["nf-gname"]} />
                      </Field>
                      <Field label="Guardian relationship to nominee" required error={errors["nf-grel"]}>
                        <TextInput value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} maxLength={40} hasError={!!errors["nf-grel"]} />
                      </Field>
                      <Field label="Guardian address" required wide error={errors["nf-gaddress"]}>
                        <TextArea value={guardianAddress} onChange={(e) => setGuardianAddress(e.target.value)} maxLength={220} style={{ minHeight: 66 }} hasError={!!errors["nf-gaddress"]} />
                      </Field>
                    </>
                  ) : null}

                  <FormActions className="flex-col items-stretch">
                    <Btn variant="block" onClick={submit}>
                      {editingId ? "Save Changes" : "Add Nominee"}
                    </Btn>
                    {editingId ? <Btn onClick={clearForm}>Cancel edit</Btn> : null}
                    <Btn onClick={clearForm}>Clear</Btn>
                    <Note className="!m-0">Nothing here leaves your browser.</Note>
                  </FormActions>
                </FormGrid>
              </>
            )}

            {pending ? (
              <div className="bg-tint border border-border-lt rounded-lg p-4 mt-4 text-[12.5px]">
                <span className="block font-bold text-navy mb-2">Confirm with one-time password — displayed, never sent</span>
                <div>
                  {editingId ? "Update " : "Register "} {pending.name} to confirm.
                </div>
                <div className="inline-block font-num text-[26px] font-bold tracking-widest text-navy bg-white border border-border rounded-md px-4 py-2 my-1.5">
                  {otp}
                </div>
                <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
                  <input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmOtp()}
                    className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-[5px]"
                    aria-label="One-time password"
                  />
                  <Btn variant="approve" onClick={confirmOtp}>
                    Confirm
                  </Btn>
                  <Btn onClick={() => { setPending(null); setOtp(""); }}>Cancel</Btn>
                </div>
                {otpError ? <div className="text-neg text-xs font-semibold mt-2.5">{otpError}</div> : null}
              </div>
            ) : null}
          </PanelBody>
        </Panel>

        <Panel className="mb-0 flex flex-col">
          <div className="flex items-center justify-between gap-4 flex-wrap px-3.5 py-2.5 bg-gradient-to-b from-[#F2F6FA] to-panel-head border-b border-border">
            <div>
              <h2 className="text-[13px] font-bold text-navy">Registered Nominee Directory</h2>
              <p className="mt-0.5 text-[11px] text-ink-2">
                {existing ? `${existing.name} is registered as your nominee` : "No nominee registered on your NetBanking profile"}
              </p>
            </div>
            <Tag variant="completed">
              {store.nominees.length} {store.nominees.length === 1 ? "Nominee" : "Nominees"}
            </Tag>
          </div>
          <PanelBody>
            <DirectoryList>
              {store.nominees.length === 0 ? (
                <DirectoryEmpty>No nominee registered. Add one using the form.</DirectoryEmpty>
              ) : (
                store.nominees.map((nm) => {
                  const nmMinor = isMinorDob(nm.dob);
                  return (
                    <DirectoryCard
                      key={nm.id}
                      open={editingId === nm.id}
                      name={nm.name}
                      badge={
                        <>
                          <Tag variant="processing">{nm.relationship}</Tag>
                          {nmMinor ? <Tag variant="pending">Minor</Tag> : null}
                        </>
                      }
                      meta={[
                        `DOB: ${nm.dob} · Age ${ageOn(nm.dob, todayIso())}`,
                        ...(nmMinor ? [`Guardian: ${nm.guardianName || "—"}${nm.guardianRelationship ? ` (${nm.guardianRelationship})` : ""}`] : []),
                      ]}
                      sub={nm.address}
                      actions={
                        <>
                          <Btn variant="primary" onClick={() => startEdit(nm)}>
                            Edit
                          </Btn>
                          <Btn onClick={() => removeNominee(nm.id)}>Remove</Btn>
                        </>
                      }
                    />
                  );
                })
              )}
            </DirectoryList>
          </PanelBody>
          <PanelBody>
            <Note>A nominee under 18 cannot receive funds directly, so a guardian must be named at registration — the guardian holds the entitlement until the nominee reaches majority.</Note>
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelHead title="Nomination History" note={`${store.nomineeAudit.length} ${store.nomineeAudit.length === 1 ? "entry" : "entries"}`} />
        <PanelBody flush>
          <ol className="list-none m-0 p-0">
            {store.nomineeAudit.map((entry, i) => (
              <li key={i} className="flex gap-3 px-4.5 py-2.5 border-b border-border-lt last:border-b-0 text-xs">
                <span className="text-ink-2">{entry.at}</span>
                <span>{entry.action}</span>
              </li>
            ))}
          </ol>
        </PanelBody>
        <PanelBody>
          <Note>
            Every registration, variation and cancellation is recorded. A nomination change is never actioned over the telephone, and nobody
            from the institution will ask you for a password or one-time code to make one on your behalf.
          </Note>
        </PanelBody>
      </Panel>
    </>
  );
}
