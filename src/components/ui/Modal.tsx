import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({
  title,
  onClose,
  footerExtra,
  children,
}: {
  title: ReactNode;
  onClose: () => void;
  footerExtra?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-navy-dk/50 flex items-center justify-center p-5 z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-[480px] w-full shadow-2xl overflow-hidden" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-lt">
          <h3 className="m-0 text-[14px] font-bold text-navy">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-ink-2 hover:text-navy flex-none">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto text-[12.5px] leading-relaxed [&>p]:mb-2.5 [&>p:last-child]:mb-0">{children}</div>
        <div className="bg-tint border-t border-border-lt px-5 py-3.5 flex justify-end gap-2 flex-wrap">
          {footerExtra}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-navy-dk bg-gradient-to-b from-navy-lt to-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
