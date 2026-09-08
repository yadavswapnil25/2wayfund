import { Check } from "lucide-react";
import type { ReactNode } from "react";

export interface StepDef {
  label: string;
  sub: string;
}

export function Stepper({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <ol className="list-none m-0 flex items-center px-4.5 sm:px-5 py-4 border-b border-border-lt overflow-x-auto">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const isCurrent = n === current;
        return (
          <li key={s.label} className="flex items-center flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-none transition-colors ${
                  done ? "bg-pos text-white" : isCurrent ? "bg-navy text-white" : "bg-border-lt text-ink-2"
                }`}
              >
                {done ? <Check size={15} /> : n}
              </span>
              <span className="whitespace-nowrap">
                <span className={`block text-[12.5px] font-bold ${isCurrent ? "text-navy" : done ? "text-pos" : "text-ink-2"}`}>{s.label}</span>
                <span className="block text-[10px] text-ink-2">{s.sub}</span>
              </span>
            </div>
            {i < steps.length - 1 ? <span className={`h-[2px] w-10 sm:w-16 mx-3 flex-none rounded-full ${done ? "bg-pos" : "bg-border-lt"}`} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function WizActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 flex-wrap border-t border-border-lt pt-4 mt-4">{children}</div>;
}
