import type { ReactNode } from "react";

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function Th({ children, width, right = false }: { children: ReactNode; width?: number; right?: boolean }) {
  return (
    <th
      style={width ? { width } : undefined}
      className={`bg-tint text-left px-3 py-2 text-[10.5px] tracking-wide uppercase text-ink-2 border-b border-border whitespace-nowrap ${right ? "text-right" : ""}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, right = false, className = "" }: { children: ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-3 py-2.5 border-b border-border-lt align-top ${right ? "text-right" : ""} ${className}`}>{children}</td>;
}

export function CellStrong({ children }: { children: ReactNode }) {
  return <span className="block font-bold text-ink">{children}</span>;
}

export function CellSub({ children }: { children: ReactNode }) {
  return <span className="block text-[11px] text-ink-2 mt-0.5">{children}</span>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-6 text-ink-2">
        {children}
      </td>
    </tr>
  );
}
