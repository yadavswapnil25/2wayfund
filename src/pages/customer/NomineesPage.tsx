import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Chip, LoadingBlock, Note } from "../../components/ui/Misc";
import { useApp } from "../../state/AppContext";
import type { Nominee, NomineeAuditEntry } from "../../types/data";
import { ageOn, todayIso } from "../../lib/dates";
import { confirmNominee, deleteNominee, initiateNominee, listNomineeAudit, listNominees } from "../../services/nomineeService";
import { ApiError } from "../../services/apiClient";
import { NomineeDirectory, NomineeHistory } from "./NomineeDirectoryViews";

function isMinorDob(dob: string): boolean {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  if (dob > todayIso()) return false;
  return ageOn(dob, todayIso()) < 18;
}

/** The envelope's own message is generic — the useful, specific reason is
 * nested under the offending field instead (matches BeneficiariesPage,
 * ExchangePage). */
function firstErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const firstFieldMessage = err.fieldErrors ? Object.values(err.fieldErrors)[0]?.[0] : undefined;
    return firstFieldMessage ?? err.message;
  }
  return fallback;
}

function applyFieldErrors(err: unknown, setErr: (id: string, msg: string | null) => void): boolean {
  if (!(err instanceof ApiError) || !err.fieldErrors) return false;
  const map: Record<string, string> = {
    name: "nf-name",
    address: "nf-address",
    dob: "nf-dob",
    guardian_name: "nf-gname",
    guardian_relationship: "nf-grel",
    guardian_address: "nf-gaddress",
  };
  let applied = false;
  for (const [field, id] of Object.entries(map)) {
    const message = err.fieldErrors[field]?.[0];
    if (message) {
      setErr(id, message);
      applied = true;
    }
  }
  return applied;
}

export function NomineesPage() {
  const { store, session } = useApp();
  // Never renders seed nominees/audit — nothing shows until the real data
  // actually comes back, since whether the "one nominee already
  // registered" block applies depends entirely on the real list.
  const [nominees, setNominees] = useState<Nominee[] | null>(null);
  const [nomineeAudit, setNomineeAudit] = useState<NomineeAuditEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState(store.nomineeRelationships[0]);
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<Nominee | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  const minor = isMinorDob(dob);
  const blocked = (nominees?.length ?? 0) > 0 && !editingId;

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!session.token) {
        setLoadError("Your session has no API token — sign out and sign back in.");
        return;
      }
      try {
        const [realNominees, realAudit] = await Promise.all([listNominees(session.token, signal), listNomineeAudit(session.token, signal)]);
        setNominees(realNominees);
        setNomineeAudit(realAudit);
        setLoadError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load your nominee details. Please try again.");
      }
    },
    [session.token],
  );

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  function setErr(id: string, msg: string | null) {
    setErrors((e) => ({ ...e, [id]: msg }));
  }

  function clearForm() {
    setEditingId(null);
    setName("");
    setRelationship(store.nomineeRelationships[0]);
    setDob("");
    setAddress("");
    setGuardianName("");
    setGuardianRelationship("");
    setGuardianAddress("");
    setErrors({});
    setFormError(null);
    setPending(null);
    setOtpInput("");
    setOtpError(null);
  }

  function startEdit(nm: Nominee) {
    setEditingId(nm.id);
    setName(nm.name);
    setRelationship(nm.relationship);
    setDob(nm.dob);
    setAddress(nm.address);
    setGuardianName(nm.guardianName);
    setGuardianRelationship(nm.guardianRelationship);
    setGuardianAddress(nm.guardianAddress);
    setErrors({});
    setFormError(null);
    setPending(null);
  }

  async function removeNominee(id: string) {
    if (!session.token || submitting) return;
    setSubmitting(true);
    try {
      await deleteNominee(id, session.token);
      await refresh();
      if (editingId === id) clearForm();
    } catch (err) {
      setFormError(firstErrorMessage(err, "Could not remove that nominee. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  function validate(): boolean {
    let ok = true;
    if (!name.trim()) {
      setErr("nf-name", "Enter the nominee’s name.");
      ok = false;
    } else setErr("nf-name", null);
    if (!address.trim()) {
      setErr("nf-address", "Enter the nominee’s address.");
      ok = false;
    } else setErr("nf-address", null);

    if (!dob) {
      setErr("nf-dob", "Enter a date of birth.");
      ok = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      setErr("nf-dob", "Enter a valid date.");
      ok = false;
    } else if (dob > todayIso()) {
      setErr("nf-dob", "Date of birth cannot be in the future.");
      ok = false;
    } else setErr("nf-dob", null);

    if (isMinorDob(dob)) {
      if (!guardianName.trim()) {
        setErr("nf-gname", "A guardian must be named for a nominee under 18.");
        ok = false;
      } else setErr("nf-gname", null);
      if (!guardianRelationship.trim()) {
        setErr("nf-grel", "State the guardian’s relationship to the nominee.");
        ok = false;
      } else setErr("nf-grel", null);
      if (!guardianAddress.trim()) {
        setErr("nf-gaddress", "Enter the guardian’s address.");
        ok = false;
      } else setErr("nf-gaddress", null);
    }

    return ok;
  }

  async function submit() {
    if (submitting || !validate() || !session.token) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await initiateNominee(
        {
          name: name.trim(),
          relationship,
          dob,
          address: address.trim(),
          guardianName: minor ? guardianName.trim() : undefined,
          guardianRelationship: minor ? guardianRelationship.trim() : undefined,
          guardianAddress: minor ? guardianAddress.trim() : undefined,
        },
        session.token,
      );
      setPending(result);
      setOtpInput("");
      setOtpError(null);
    } catch (err) {
      if (!applyFieldErrors(err, setErr)) {
        setFormError(firstErrorMessage(err, "Could not register this nominee. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmOtp() {
    if (submitting || !pending || !session.token) return;
    if (!/^\d{6}$/.test(otpInput)) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }

    setOtpError(null);
    setSubmitting(true);
    try {
      const result = await confirmNominee(pending.id, otpInput, session.token);
      await refresh();
      setConfirmMsg(`${result.name} is now registered as your nominee.`);
      clearForm();
    } catch (err) {
      setOtpError(firstErrorMessage(err, "Could not confirm that code. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHead
        title="Nomination"
        lede="Register who receives the balance on your accounts. Nomination applies across the whole relationship, and only one nominee can be registered at a time."
      />

      {nominees === null ? (
        loadError ? (
          <Note danger className="mb-5">
            {loadError}
          </Note>
        ) : (
          <LoadingBlock label="Loading your nomination details…" />
        )
      ) : (
      <div className="grid gap-5 mb-5 items-start min-[1001px]:grid-cols-2">
        {/* Add / update nominee */}
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <span className="flex-none w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserPlus size={17} />
            </span>
            <div>
              <h3 className="m-0 text-[14.5px] font-bold text-navy">{editingId ? `Update Nominee — ${name}` : "Add a Nominee"}</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Confirmation required</p>
            </div>
          </div>

          <div className="px-4.5 sm:px-5 py-4">
            <p className="mt-0 text-xs text-ink-2 mb-3">
              Register the person who will receive your account balance. Only one nominee can be registered on this relationship at a time.
            </p>
            {formError ? <Note danger>{formError}</Note> : null}
            {confirmMsg ? (
              <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-3">
                <h3 className="text-pos font-bold mb-2 text-sm">Nominee registered</h3>
                <p className="m-0 text-xs">{confirmMsg}</p>
              </div>
            ) : null}

            {blocked ? (
              <div className="rounded-2xl border border-border-lt bg-[#EAF1F9] px-4.5 py-4">
                <h3 className="m-0 text-[13px] font-bold text-navy">One nominee already registered</h3>
                <p className="m-0 mt-1.5 text-[12.5px] text-ink">
                  This relationship allows only one nominee at a time. Edit the existing nominee in the directory, or remove it first to register
                  someone else.
                </p>
              </div>
            ) : !pending ? (
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
                    <TextArea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      maxLength={220}
                      style={{ minHeight: 66 }}
                      hasError={!!errors["nf-address"]}
                    />
                  </Field>

                  {minor ? (
                    <>
                      <div className="col-span-2">
                        <p className="m-0 text-xs text-ink-2 font-semibold">Guardian — required for a nominee under 18</p>
                      </div>
                      <Field label="Guardian name" required error={errors["nf-gname"]}>
                        <TextInput
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          maxLength={70}
                          hasError={!!errors["nf-gname"]}
                        />
                      </Field>
                      <Field label="Guardian relationship to nominee" required error={errors["nf-grel"]}>
                        <TextInput
                          value={guardianRelationship}
                          onChange={(e) => setGuardianRelationship(e.target.value)}
                          maxLength={40}
                          hasError={!!errors["nf-grel"]}
                        />
                      </Field>
                      <Field label="Guardian address" required wide error={errors["nf-gaddress"]}>
                        <TextArea
                          value={guardianAddress}
                          onChange={(e) => setGuardianAddress(e.target.value)}
                          maxLength={220}
                          style={{ minHeight: 66 }}
                          hasError={!!errors["nf-gaddress"]}
                        />
                      </Field>
                    </>
                  ) : null}

                  <FormActions className="flex-col items-stretch">
                    <Btn variant="block" onClick={() => void submit()} disabled={submitting}>
                      {submitting ? "Sending code…" : editingId ? "Save Changes" : "Add Nominee"}
                    </Btn>
                    {editingId ? <Btn onClick={clearForm}>Cancel edit</Btn> : null}
                    <Btn onClick={clearForm}>Clear</Btn>
                  </FormActions>
                </FormGrid>
              </>
            ) : null}

            {pending ? (
              <div className="bg-tint border border-border-lt rounded-xl p-4 mt-4 text-[12.5px]">
                <span className="block font-bold text-navy mb-2">Enter the one-time code we emailed you</span>
                <div>
                  {editingId ? "Updating" : "Registering"} {pending.name} is a protected action — check the email on file for this account. The
                  code expires 10 minutes after it's sent, and can only be used once.
                </div>
                <div className="flex gap-2.5 flex-wrap items-center mt-2.5">
                  <input
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && void confirmOtp()}
                    inputMode="numeric"
                    autoComplete="off"
                    className="w-[140px] font-num text-[15px] px-2.5 py-2 border border-border rounded-lg"
                    aria-label="One-time code"
                  />
                  <Btn variant="approve" onClick={() => void confirmOtp()} disabled={submitting}>
                    {submitting ? "Confirming…" : "Confirm"}
                  </Btn>
                  <Btn onClick={clearForm} disabled={submitting}>
                    Cancel
                  </Btn>
                </div>
                {otpError ? <div className="text-neg text-xs font-semibold mt-2.5">{otpError}</div> : null}
              </div>
            ) : null}
          </div>
        </div>

        <NomineeDirectory nominees={nominees} editingId={editingId} submitting={submitting} onEdit={startEdit} onRemove={(id) => void removeNominee(id)} />
      </div>
      )}

      {nominees !== null ? <NomineeHistory entries={nomineeAudit} /> : null}
    </>
  );
}
