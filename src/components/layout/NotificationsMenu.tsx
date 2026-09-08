import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../state/AppContext";
import { Tag } from "../ui/Tag";

export function NotificationsMenu() {
  const { store, setStore } = useApp();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const messages = store.messages.filter((m) => m.to === "all" || m.to === store.user.id);
  const unread = messages.filter((m) => !m.read).length;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function markAllRead() {
    setStore((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.to === "all" || m.to === s.user.id ? { ...m, read: true } : m)),
    }));
  }

  function markRead(id: string) {
    setStore((s) => ({ ...s, messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) }));
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Bank Notices"
        aria-expanded={open}
        className="relative text-ink-2 border border-border-lt bg-white p-2 rounded-full hover:bg-tint"
      >
        <Bell size={14} />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-neg text-white text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-32px)] bg-white border border-border-lt rounded-xl shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border-lt">
            <div>
              <h3 className="m-0 text-[13px] font-bold text-navy">Bank Notices</h3>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
                {unread ? ` · ${unread} unread` : ""}
              </p>
            </div>
            {unread > 0 ? (
              <button type="button" onClick={markAllRead} className="text-[11px] font-semibold text-navy-lt hover:underline flex-none">
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-border-lt">
            {messages.length === 0 ? (
              <p className="text-center py-8 text-ink-2 text-[12px] m-0">No messages.</p>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => markRead(m.id)}
                  className={`w-full text-left px-4 py-3 ${!m.read ? "bg-[#EEF5FC]" : "bg-white"} hover:bg-tint transition-colors`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {!m.read ? <span className="w-1.5 h-1.5 rounded-full bg-navy-lt flex-none" /> : null}
                      <strong className="text-[12.5px] text-ink truncate">{m.subject}</strong>
                    </div>
                    <span className="text-[10px] text-ink-2 font-num whitespace-nowrap flex-none">{m.sentAt}</span>
                  </div>
                  <p className="m-0 mt-1 text-[11.5px] text-ink-2 line-clamp-2">{m.body.split("\n")[0]}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Tag variant={m.priority === "High" ? "review" : "submitted"}>{m.priority}</Tag>
                    <span className="text-[10.5px] text-ink-2">{m.category}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
