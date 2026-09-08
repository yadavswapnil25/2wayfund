import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-border-lt rounded-md mb-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PanelHead({ title, note, children }: { title: ReactNode; note?: ReactNode; children?: ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#F2F6FA] to-panel-head border-b border-border px-3.5 py-2.5 flex items-center justify-between gap-4 flex-wrap">
      <h2 className="text-[13px] font-bold text-navy">{title}</h2>
      {note !== undefined ? <span className="text-[11px] text-ink-2">{note}</span> : null}
      {children}
    </div>
  );
}

export function PanelBody({ children, flush = false, className = "" }: { children: ReactNode; flush?: boolean; className?: string }) {
  return <div className={`${flush ? "" : "px-4.5 py-4"} ${className}`}>{children}</div>;
}
