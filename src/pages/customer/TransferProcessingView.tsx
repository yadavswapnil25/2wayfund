import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const STEP_INTERVAL_MS = 550;

/** Cosmetic step-by-step animation through the transfer's final policy
 * steps (Authorization → Processing → Confirmation → Reference number)
 * while the real API call is in flight — gives the customer visible
 * feedback instead of a static disabled button during network latency.
 * TransferFundsPage times its own minimum display duration so this has
 * settled on the last step by the time the real result is ready. */
export function TransferProcessingPanel({ steps }: { steps: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= steps.length - 1) return;
    const timer = setTimeout(() => setActiveIndex((i) => i + 1), STEP_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, steps.length]);

  return (
    <div className="p-8 sm:p-10 flex flex-col items-center text-center">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#EAF1F9] text-navy mb-4">
        <Loader2 size={26} className="animate-spin" />
      </span>
      <h3 className="m-0 text-[15px] font-bold text-navy">Processing Your Transaction</h3>
      <p className="m-0 mt-1.5 text-[12.5px] text-ink-2 max-w-sm">
        Please don&apos;t close or refresh this page while we complete your transfer.
      </p>
      <ol className="list-none m-0 mt-5 w-full max-w-xs text-left">
        {steps.map((step, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={step} className="flex items-center gap-2.5 py-1.5 text-[12.5px]">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-none ${
                  done ? "bg-pos text-white" : active ? "bg-[#EAF1F9] text-navy" : "bg-tint text-ink-2"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={13} />
                ) : active ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </span>
              <span className={done || active ? "text-ink font-medium" : "text-ink-2"}>{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
