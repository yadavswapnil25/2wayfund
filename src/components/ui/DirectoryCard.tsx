import type { ReactNode } from "react";

export function DirectoryList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function DirectoryCard({
  name,
  badge,
  meta,
  sub,
  actions,
  open = false,
}: {
  name: ReactNode;
  badge?: ReactNode;
  meta: ReactNode[];
  sub?: ReactNode;
  actions: ReactNode;
  open?: boolean;
}) {
  return (
    <div
      className={`border rounded-lg px-4 py-3.5 flex items-start justify-between gap-3.5 flex-wrap ${
        open ? "border-navy-lt bg-[#F4F8FC]" : "border-border-lt"
      }`}
    >
      <div className="min-w-0">
        <div className="text-sm font-bold text-navy flex items-center gap-2 flex-wrap">
          <span>{name}</span>
          {badge}
        </div>
        {meta.map((m, i) => (
          <div key={i} className="mt-1 text-xs text-ink-2">
            {m}
          </div>
        ))}
        {sub ? <div className="mt-0.5 text-[11.5px] text-ink-2">{sub}</div> : null}
      </div>
      <div className="flex gap-2 flex-shrink-0">{actions}</div>
    </div>
  );
}

export function DirectoryEmpty({ children }: { children: ReactNode }) {
  return <div className="p-5.5 text-center text-ink-2 text-[12.5px] border border-dashed border-border rounded-lg">{children}</div>;
}
