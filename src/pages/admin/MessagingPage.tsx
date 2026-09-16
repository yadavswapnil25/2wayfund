import { useEffect, useState } from "react";
import { Search, Send, Trash2, X } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { MSG_TEMPLATES } from "../../data/constants";
import { stamp } from "../../lib/dates";
import { listCustomerAccounts, type CustomerAccountDto } from "../../services/adminAccountService";
import { ApiError } from "../../services/apiClient";
import type { Message } from "../../types/data";

function recipientLabel(to: string, directory: Record<string, CustomerAccountDto>): string {
  if (to === "all") return "All customers";
  return directory[to]?.name ?? "Former customer";
}

export function MessagingPage() {
  const { store, setStore, session } = useApp();

  const [to, setTo] = useState("all");
  const [category, setCategory] = useState(store.messageCategories[0] ?? "");
  const [priority, setPriority] = useState<Message["priority"]>("Normal");
  const [templateIdx, setTemplateIdx] = useState("0");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  // Never renders a fabricated single-customer recipient list — nothing
  // shows in the dropdown until the real customer directory actually
  // comes back, success or failure (matches CustomerAccountsList). The
  // backend only ever returns 10 accounts per page, so `results` is just
  // the current search's matches (all 40+ customers, searched server-side
  // by email) — not "every customer". `directory` separately accumulates
  // every customer ever seen across searches, so a message sent to
  // someone earlier still resolves to their real name later even after
  // the search box has moved on to a different query.
  const [recipientQuery, setRecipientQuery] = useState("");
  const [results, setResults] = useState<CustomerAccountDto[] | null>(null);
  const [directory, setDirectory] = useState<Record<string, CustomerAccountDto>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const token = session.token;
    if (!token) {
      setLoadError("Your session has no API token — sign out and sign back in.");
      return;
    }
    const handle = setTimeout(() => {
      void listCustomerAccounts(token, { email: recipientQuery.trim() || undefined }, controller.signal)
        .then((result) => {
          setResults(result.items);
          setDirectory((prev) => {
            const next = { ...prev };
            for (const c of result.items) next[String(c.id)] = c;
            return next;
          });
          setLoadError(null);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          setLoadError(err instanceof ApiError ? err.message : "Could not load the customer directory. Please try again.");
        });
    }, recipientQuery ? 350 : 0);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [session.token, recipientQuery]);

  function applyTemplate(idx: string) {
    setTemplateIdx(idx);
    const t = MSG_TEMPLATES[Number(idx)];
    if (!t) return;
    setSubject(t.subject);
    setBody(t.body);
    if (t.category) setCategory(t.category);
    setErrors((e) => ({ ...e, subject: null, body: null }));
  }

  function clearForm() {
    setTo("all");
    setRecipientQuery("");
    setCategory(store.messageCategories[0] ?? "");
    setPriority("Normal");
    setTemplateIdx("0");
    setSubject("");
    setBody("");
    setErrors({});
  }

  function send() {
    const errs: Record<string, string | null> = {};
    if (!subject.trim()) errs.subject = "Enter a subject.";
    if (!body.trim()) errs.body = "Enter a message.";
    else if (body.trim().length < 12) errs.body = "Message is too short to be useful.";
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    const message: Message = {
      id: "m" + (store.messages.length + 1 + Math.floor(Math.random() * 1000)),
      to,
      category,
      priority,
      subject: subject.trim(),
      body: body.trim(),
      sentAt: stamp(),
      sentBy: session.display || "Operations",
      read: false,
    };
    setStore((s) => ({ ...s, messages: [message, ...s.messages] }));
    setConfirmMsg(
      `Delivered to ${recipientLabel(to, directory)} and now visible in their inbox. Delivery is in-app only — no email, SMS or push notification was dispatched.`
    );
    clearForm();
  }

  function recall(id: string) {
    setStore((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) }));
  }

  return (
    <>
      <PageHead title="Customer Messaging" lede="Compose and send in-app secure messages. No email, SMS or push provider is integrated." />

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <span className="flex-none w-10 h-10 rounded-xl bg-[#EAF1F9] text-navy flex items-center justify-center">
            <Send size={17} />
          </span>
          <div>
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Compose</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">Delivery is in-app only</p>
          </div>
        </div>

        <div className="px-4.5 sm:px-5 py-4">
          {confirmMsg ? (
            <div className="bg-[#F0F8F3] border border-[#A8D4BB] rounded-xl p-4 mb-4">
              <h3 className="text-pos font-bold mb-1.5 text-sm">Message sent</h3>
              <p className="m-0 text-xs">{confirmMsg}</p>
            </div>
          ) : null}

          <FormGrid>
            <Field
              label="Recipient"
              hint={
                loadError ??
                (recipientQuery && results !== null
                  ? `${results.length} match${results.length === 1 ? "" : "es"} for "${recipientQuery}" — searches by email across every customer.`
                  : undefined)
              }
            >
              <div className="relative mb-1.5">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
                <TextInput
                  type="text"
                  placeholder="Search all customers by email…"
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  className="pl-8 pr-8"
                />
                {recipientQuery ? (
                  <button
                    type="button"
                    onClick={() => setRecipientQuery("")}
                    aria-label="Clear recipient search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-2 hover:text-navy"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>
              <Select value={to} onChange={(e) => setTo(e.target.value)} disabled={results === null}>
                <option value="all">All customers</option>
                {/* Keeps the current selection visible even once a new
                    search narrows it out of `results` — otherwise picking
                    someone, then searching again, silently blanks the
                    dropdown while `to` still (correctly) points at them. */}
                {to !== "all" && directory[to] && !results?.some((c) => String(c.id) === to) ? (
                  <option value={to}>
                    {directory[to].name} ({directory[to].reference})
                  </option>
                ) : null}
                {(results ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.reference})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {store.messageCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Message["priority"])}>
                <option>Normal</option>
                <option>High</option>
              </Select>
            </Field>
            <Field label="Template">
              <Select value={templateIdx} onChange={(e) => applyTemplate(e.target.value)}>
                {MSG_TEMPLATES.map((t, i) => (
                  <option key={t.label} value={i}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Subject" required wide error={errors.subject}>
              <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} hasError={!!errors.subject} />
            </Field>
            <Field label="Message" required wide error={errors.body}>
              <TextArea value={body} onChange={(e) => setBody(e.target.value)} hasError={!!errors.body} className="min-h-[110px]" />
            </Field>
            <FormActions>
              <Btn variant="primary" onClick={send}>
                Send
              </Btn>
              <Btn onClick={clearForm}>Clear</Btn>
            </FormActions>
          </FormGrid>
        </div>
      </div>

      <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14.5px] font-bold text-navy">Sent Messages</h3>
          <p className="m-0 mt-0.5 text-[11px] text-ink-2">
            {store.messages.length} {store.messages.length === 1 ? "message" : "messages"}
          </p>
        </div>

        {store.messages.length === 0 ? (
          <p className="text-center py-10 text-ink-2 text-[12.5px]">No messages sent.</p>
        ) : (
          <div className="divide-y divide-border-lt">
            {store.messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 px-4.5 sm:px-5 py-3.5 flex-wrap sm:flex-nowrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[13px] text-ink">{m.subject}</span>
                    <Tag variant={m.priority === "High" ? "rejected" : "submitted"}>{m.priority}</Tag>
                    <Tag variant={m.read ? "approved" : "review"}>{m.read ? "Read" : "Unread"}</Tag>
                  </div>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">
                    {recipientLabel(m.to, directory)} · {m.category} · {m.sentAt}
                  </p>
                  <p className="m-0 mt-0.5 text-[11px] text-ink-2 truncate">{m.body.split("\n")[0]}</p>
                </div>
                <button
                  type="button"
                  onClick={() => recall(m.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E3B8B0] bg-white px-3 py-1.5 text-xs font-semibold text-neg hover:bg-[#FDF6F4] flex-none"
                >
                  <Trash2 size={13} /> Recall
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
