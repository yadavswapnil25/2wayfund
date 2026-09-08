const VARIANTS: Record<string, string> = {
  completed: "text-[#155F36] bg-[#E6F3EB] border-[#A8D4BB]",
  approved: "text-[#155F36] bg-[#E6F3EB] border-[#A8D4BB]",
  processing: "text-[#1B5FA8] bg-[#E7F0FA] border-[#A9C7E6]",
  pending: "text-amber bg-[#FBF4E1] border-[#DDC98B]",
  review: "text-amber bg-[#FBF4E1] border-[#DDC98B]",
  failed: "text-[#9E2D22] bg-[#FBEAE8] border-[#E0AEA7]",
  rejected: "text-[#9E2D22] bg-[#FBEAE8] border-[#E0AEA7]",
  submitted: "text-ink-2 bg-[#EFF2F5] border-[#C9D2DB]",
};

export function statusVariant(status: string): string {
  const key = status.toLowerCase().replace(/\s+/g, "");
  if (key === "underreview") return "review";
  return key in VARIANTS ? key : "submitted";
}

export function Tag({ children, variant, className = "" }: { children: React.ReactNode; variant: string; className?: string }) {
  const cls = VARIANTS[variant] || VARIANTS.submitted;
  return (
    <span
      className={`inline-block text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-sm whitespace-nowrap border ${cls} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusTag({ status, className = "" }: { status: string; className?: string }) {
  return (
    <Tag variant={statusVariant(status)} className={className}>
      {status}
    </Tag>
  );
}
