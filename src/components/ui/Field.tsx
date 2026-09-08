import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputCls =
  "w-full font-[inherit] text-[13px] px-2.5 py-2 border border-border bg-white text-ink rounded-[5px] focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  wide = false,
  children,
  className = "",
}: {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${wide ? "col-span-2" : ""} ${className}`}>
      {label ? (
        <label htmlFor={htmlFor} className="block mb-1 text-[11.5px] font-semibold text-ink">
          {label} {required ? <span className="text-neg">*</span> : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? <span className="block mt-1 text-[11px] text-ink-2">{hint}</span> : null}
      {error ? <span className="block mt-1 text-[11px] font-semibold text-neg">{error}</span> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, className = "", ...rest } = props;
  return <input className={`${inputCls} ${hasError ? "border-neg bg-[#FEF8F7]" : ""} ${className}`} {...rest} />;
}

export function NumInput(props: InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, className = "", ...rest } = props;
  return (
    <input
      className={`${inputCls} font-num tabular-nums text-[15px] font-semibold ${hasError ? "border-neg bg-[#FEF8F7]" : ""} ${className}`}
      {...rest}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  const { hasError, className = "", ...rest } = props;
  return <textarea className={`${inputCls} ${hasError ? "border-neg bg-[#FEF8F7]" : ""} ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  const { hasError, className = "", children, ...rest } = props;
  return (
    <select className={`${inputCls} ${hasError ? "border-neg bg-[#FEF8F7]" : ""} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function FormGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-2 gap-4 gap-x-5 max-[560px]:grid-cols-1 ${className}`}>{children}</div>;
}

export function FormActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`col-span-2 max-[560px]:col-span-1 flex items-center gap-3 flex-wrap border-t border-border-lt pt-3.5 mt-1 ${className}`}>
      {children}
    </div>
  );
}
