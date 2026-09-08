import type { ReactNode } from "react";

export function Callout({
  title,
  children,
  variant = "info",
  className = "",
}: {
  title: string;
  children: ReactNode;
  variant?: "info" | "warn";
  className?: string;
}) {
  const border = variant === "warn" ? "border-l-neg bg-[#FDF6F4] border-[#E3C4BC]" : "border-l-gold border-border";
  const titleColor = variant === "warn" ? "text-[#9E2D22]" : "text-navy";
  return (
    <div className={`border border-l-4 rounded-lg px-4.5 py-4 mb-4 ${border} ${className}`}>
      <h3 className={`mb-2 text-[13.5px] font-bold ${titleColor}`}>{title}</h3>
      <div className="text-[12.5px] leading-relaxed [&>p]:mb-2.5 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}

export function Note({ children, danger = false, className = "" }: { children: ReactNode; danger?: boolean; className?: string }) {
  return <p className={`m-0 text-xs leading-relaxed ${danger ? "text-neg font-semibold" : "text-ink-2"} ${className}`}>{children}</p>;
}

export function KV({ items }: { items: [string, ReactNode][] }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(175px,1fr))" }}>
      {items.map(([label, value], i) => (
        <div key={i} className="px-3.5 py-2.5 border-b border-r border-border-lt last:border-r-0">
          <span className="block mb-1 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">{label}</span>
          <p className="m-0 text-[13px] font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function DetailGrid({ items }: { items: [string, ReactNode, ReactNode?][] }) {
  return (
    <div className="grid gap-3.5 mb-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))" }}>
      {items.map(([label, value, sub], i) => (
        <div key={i}>
          <span className="block mb-0.5 text-[10.5px] tracking-wide uppercase text-ink-2 font-semibold">{label}</span>
          <p className="m-0 text-[13px] font-semibold text-ink">{value}</p>
          {sub ? <span className="block text-[11px] text-ink-2 mt-0.5">{sub}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function ReviewLine({ k, v, kind }: { k: ReactNode; v: ReactNode; kind?: "fee" | "total" }) {
  const vCls =
    kind === "fee" ? "text-warn font-semibold" : kind === "total" ? "text-[14px] text-navy font-bold" : "";
  return (
    <div className="flex items-center justify-between py-2 border-b border-dotted border-border text-[12.5px] last:border-b-0">
      <span>{k}</span>
      <span className={vCls}>{v}</span>
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-[inherit] text-xs font-semibold px-3.5 py-1.5 rounded-full border cursor-pointer ${
        active ? "bg-navy border-navy text-white" : "bg-white border-border text-navy hover:border-gold-dk"
      }`}
    >
      {children}
    </button>
  );
}

export function TypeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-[inherit] px-3.5 py-3 text-center font-bold text-[13px] border rounded-lg cursor-pointer ${
        active ? "border-navy-lt bg-[#EAF1F9] text-navy shadow-[inset_0_0_0_1px_var(--color-navy-lt)]" : "border-border bg-white text-ink-2 hover:border-navy-lt"
      }`}
    >
      {children}
    </button>
  );
}
