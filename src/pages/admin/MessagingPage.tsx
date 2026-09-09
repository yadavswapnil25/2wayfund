import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { Field, FormActions, FormGrid, Select, TextArea, TextInput } from "../../components/ui/Field";
import { Btn } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { useApp } from "../../state/AppContext";
import { MSG_TEMPLATES } from "../../data/constants";
import { stamp } from "../../lib/dates";
import type { Message } from "../../types/data";

function recipientLabel(to: string, userName: string): string {
  return to === "all" ? "All customers" : userName;
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
      `Delivered to ${recipientLabel(to, store.user.name)} and now visible in their inbox. Delivery is in-app only — no email, SMS or push notification was dispatched.`
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
            <Field label="Recipient">
              <Select value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="all">All customers</option>
                <option value={store.user.id}>
                  {store.user.name} ({store.user.reference})
                </option>
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
                    {recipientLabel(m.to, store.user.name)} · {m.category} · {m.sentAt}
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
