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
      className="fixed inset-0 bg-navy-dk/55 flex items-center justify-center p-5 z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-navy-dk max-w-[470px] w-full shadow-2xl rounded-[3px] overflow-hidden" role="dialog" aria-modal="true">
        <div className="bg-gradient-to-b from-navy-lt to-navy text-white px-4 py-2.5 text-[13px] font-bold">{title}</div>
        <div className="p-4 max-h-[70vh] overflow-y-auto text-[12.5px] leading-relaxed [&>p]:mb-2.5 [&>p:last-child]:mb-0">{children}</div>
        <div className="bg-tint border-t border-border px-4 py-2.5 flex justify-end gap-2 flex-wrap">
          {footerExtra}
          <button
            type="button"
            onClick={onClose}
            className="inline-block border rounded-[5px] px-4 py-2 text-xs font-semibold cursor-pointer bg-gradient-to-b from-navy-lt to-navy border-navy-dk text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
