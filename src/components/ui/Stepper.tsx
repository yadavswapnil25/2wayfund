export interface StepDef {
  label: string;
  sub: string;
}

export function Stepper({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <ol className="list-none m-0 flex gap-4.5 flex-wrap border-b border-border-lt px-4.5 py-3.5">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const isCurrent = n === current;
        return (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                done ? "bg-pos text-white" : isCurrent ? "bg-navy text-white" : "bg-border-lt text-ink-2"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span>
              <span className={`block text-xs font-bold ${isCurrent ? "text-navy" : "text-ink"}`}>{s.label}</span>
              <span className="block text-[10px] text-ink-2">{s.sub}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function WizActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 flex-wrap border-t border-border-lt pt-4 mt-4">{children}</div>;
}
