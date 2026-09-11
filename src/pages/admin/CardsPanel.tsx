import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { Field, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Callout } from "../../components/ui/Misc";
import { Tag } from "../../components/ui/Tag";
import { formatCode } from "../../lib/format";
import {
  createCustomerCard,
  deleteCustomerCard,
  listCustomerCards,
  updateCustomerCard,
  type AdminCardPayload,
} from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import type { Card, CurrencyCode } from "../../types/data";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "INR", "GBP", "CAD", "JPY", "AUD", "SGD", "CHF"];
const FORM_OPTIONS = ["Digital", "Physical"];

function emptyPayload(): AdminCardPayload {
  return { type: "Debit", last4: "", expiry: "", cvv: "", forms: ["Digital"], capability: "", funding: "ledger", currency: "USD" };
}

function toPayload(c: Card): AdminCardPayload {
  return {
    type: c.type,
    last4: c.last4,
    expiry: c.expiry,
    cvv: c.cvv,
    forms: c.forms,
    capability: c.capability,
    funding: c.funding,
    currency: c.currency,
    capPerTxn: c.capPerTxn,
    capNote: c.capNote,
    creditLimit: c.creditLimit,
    outstanding: c.outstanding,
    prepaid: c.prepaid,
  };
}

/** The Compliance Console's card management panel, shown inside a
 * customer's expanded row in Customer Accounts — matches AddFundsPanel's
 * placement and shape. A card is provisioned and maintained by the
 * institution, so this is the only place one is ever created, edited, or
 * removed; the customer's own Cards page only ever reads. */
export function CardsPanel({ userId, token }: { userId: number; token: string }) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [payload, setPayload] = useState<AdminCardPayload>(emptyPayload());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const result = await listCustomerCards(userId, token, signal);
        setCards(result);
        setLoadError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setLoadError(err instanceof ApiError ? err.message : "Could not load this account's cards.");
      }
    },
    [userId, token],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function startAdd() {
    setEditingId("new");
    setPayload(emptyPayload());
    setFormError(null);
  }

  function startEdit(card: Card) {
    setEditingId(card.id);
    setPayload(toPayload(card));
    setFormError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError(null);
  }

  function toggleForm(form: string) {
    setPayload((p) => ({ ...p, forms: p.forms.includes(form) ? p.forms.filter((f) => f !== form) : [...p.forms, form] }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !editingId) return;
    if (!/^\d{4}$/.test(payload.last4)) {
      setFormError("Last 4 digits must be exactly 4 numeric digits.");
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payload.expiry)) {
      setFormError("Expiry must be in MM/YY format.");
      return;
    }
    if (!/^\d{3}$/.test(payload.cvv)) {
      setFormError("CVV must be exactly 3 numeric digits.");
      return;
    }
    if (payload.forms.length === 0) {
      setFormError("Select at least one card form.");
      return;
    }
    if (!payload.capability.trim()) {
      setFormError("Enter the card's capability description.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      if (editingId === "new") {
        await createCustomerCard(userId, payload, token);
      } else {
        await updateCustomerCard(userId, editingId, payload, token);
      }
      await load();
      setEditingId(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save this card. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await deleteCustomerCard(userId, id, token);
      await load();
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not remove this card. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border-lt">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <CreditCard size={13} className="text-navy" />
          <h4 className="m-0 text-[11px] font-bold uppercase tracking-wide text-navy">Cards</h4>
        </div>
        {editingId === null ? (
          <button type="button" onClick={startAdd} className="text-[11px] font-semibold text-navy underline">
            + Add Card
          </button>
        ) : null}
      </div>

      {loadError ? (
        <Callout title="Couldn't load cards" variant="warn" className="mb-3">
          <p>{loadError}</p>
        </Callout>
      ) : null}

      {cards === null ? (
        <p className="m-0 text-[11.5px] text-ink-2">Loading…</p>
      ) : cards.length === 0 && editingId === null ? (
        <p className="m-0 text-[11.5px] text-ink-2">No cards issued yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5 mb-3">
          {cards.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-border-lt px-2.5 py-1.5">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Tag variant={c.type === "Debit" ? "processing" : "completed"}>{c.type}</Tag>
                  <span className="font-num text-[12px] font-semibold text-ink">•••• {c.last4}</span>
                  <span className="text-[11px] text-ink-2">exp {c.expiry}</span>
                </div>
                {c.funding === "credit" && c.creditLimit != null ? (
                  <p className="m-0 mt-0.5 text-[10.5px] text-ink-2">Limit {formatCode(c.creditLimit, c.currency)}</p>
                ) : null}
              </div>
              <div className="flex-none flex items-center gap-1.5">
                <button type="button" onClick={() => startEdit(c)} aria-label={`Edit card ending ${c.last4}`} className="text-navy hover:text-navy-dk">
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(c.id)}
                  disabled={submitting}
                  aria-label={`Remove card ending ${c.last4}`}
                  className="text-neg hover:text-[#9E2D22] disabled:opacity-40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId !== null ? (
        <form onSubmit={(e) => void submit(e)} className="rounded-lg border border-border-lt bg-tint/40 p-3">
          {formError ? (
            <Callout title="Couldn't save this card" variant="warn" className="mb-3">
              <p>{formError}</p>
            </Callout>
          ) : null}
          <FormGrid>
            <Field label="Type" htmlFor={`card-type-${userId}`}>
              <Select id={`card-type-${userId}`} value={payload.type} onChange={(e) => setPayload((p) => ({ ...p, type: e.target.value as Card["type"] }))}>
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </Select>
            </Field>
            <Field label="Funding" htmlFor={`card-funding-${userId}`}>
              <Select
                id={`card-funding-${userId}`}
                value={payload.funding}
                onChange={(e) => setPayload((p) => ({ ...p, funding: e.target.value as Card["funding"] }))}
              >
                <option value="ledger">Ledger-linked</option>
                <option value="credit">Credit</option>
                <option value="prepaid">Prepaid</option>
              </Select>
            </Field>
            <Field label="Last 4 digits" htmlFor={`card-last4-${userId}`}>
              <TextInput
                id={`card-last4-${userId}`}
                value={payload.last4}
                onChange={(e) => setPayload((p) => ({ ...p, last4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                placeholder="4417"
                inputMode="numeric"
              />
            </Field>
            <Field label="Expiry (MM/YY)" htmlFor={`card-expiry-${userId}`}>
              <TextInput
                id={`card-expiry-${userId}`}
                value={payload.expiry}
                onChange={(e) => setPayload((p) => ({ ...p, expiry: e.target.value }))}
                placeholder="09/29"
              />
            </Field>
            <Field label="CVV" htmlFor={`card-cvv-${userId}`} hint="Fictional, prototype-only — never a real security code.">
              <TextInput
                id={`card-cvv-${userId}`}
                value={payload.cvv}
                onChange={(e) => setPayload((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                placeholder="412"
                inputMode="numeric"
              />
            </Field>
            <Field label="Currency" htmlFor={`card-currency-${userId}`}>
              <Select id={`card-currency-${userId}`} value={payload.currency} onChange={(e) => setPayload((p) => ({ ...p, currency: e.target.value as CurrencyCode }))}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Forms" wide>
              <div className="flex gap-3 pt-1.5">
                {FORM_OPTIONS.map((f) => (
                  <label key={f} className="flex items-center gap-1.5 text-[12px] text-ink">
                    <input type="checkbox" checked={payload.forms.includes(f)} onChange={() => toggleForm(f)} /> {f}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Capability description" htmlFor={`card-capability-${userId}`} wide>
              <TextArea
                id={`card-capability-${userId}`}
                value={payload.capability}
                onChange={(e) => setPayload((p) => ({ ...p, capability: e.target.value }))}
                style={{ minHeight: 50 }}
              />
            </Field>

            {payload.funding === "ledger" ? (
              <>
                <Field label="Per-transaction cap" htmlFor={`card-cap-${userId}`}>
                  <TextInput
                    id={`card-cap-${userId}`}
                    type="number"
                    value={payload.capPerTxn ?? ""}
                    onChange={(e) => setPayload((p) => ({ ...p, capPerTxn: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </Field>
                <Field label="Cap note" htmlFor={`card-capnote-${userId}`}>
                  <TextInput
                    id={`card-capnote-${userId}`}
                    value={payload.capNote ?? ""}
                    onChange={(e) => setPayload((p) => ({ ...p, capNote: e.target.value }))}
                  />
                </Field>
              </>
            ) : null}

            {payload.funding === "credit" ? (
              <>
                <Field label="Credit limit" htmlFor={`card-limit-${userId}`}>
                  <TextInput
                    id={`card-limit-${userId}`}
                    type="number"
                    value={payload.creditLimit ?? ""}
                    onChange={(e) => setPayload((p) => ({ ...p, creditLimit: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </Field>
                <Field label="Outstanding" htmlFor={`card-outstanding-${userId}`}>
                  <TextInput
                    id={`card-outstanding-${userId}`}
                    type="number"
                    value={payload.outstanding ?? ""}
                    onChange={(e) => setPayload((p) => ({ ...p, outstanding: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </Field>
              </>
            ) : null}

            {payload.funding === "prepaid" ? (
              <Field label="Prepaid balance" htmlFor={`card-prepaid-${userId}`}>
                <TextInput
                  id={`card-prepaid-${userId}`}
                  type="number"
                  value={payload.prepaid ?? ""}
                  onChange={(e) => setPayload((p) => ({ ...p, prepaid: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </Field>
            ) : null}
          </FormGrid>

          <div className="flex items-center gap-2 mt-2">
            <Btn type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId === "new" ? "Add Card" : "Save Changes"}
            </Btn>
            <Btn type="button" onClick={cancelEdit} disabled={submitting}>
              Cancel
            </Btn>
          </div>
        </form>
      ) : null}
    </div>
  );
}
