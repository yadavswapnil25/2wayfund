import { Check } from "lucide-react";

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i} className="m-0 mb-2.5 last:mb-0 text-[12.5px] text-ink-2 leading-relaxed">
          {p}
        </p>
      ))}
    </>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="list-none m-0 p-0 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[12.5px] text-ink">
          <Check size={14} className="flex-shrink-0 mt-0.5 text-pos" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function NumberedList({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ol className="list-none m-0 p-0">
      {items.map((s, i) => (
        <li key={s.title} className="flex items-start gap-3.5 py-3 border-b border-dotted border-border last:border-b-0">
          <span className="w-7 h-7 rounded-full bg-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <div>
            <span className="block text-[13px] font-bold text-ink">{s.title}</span>
            <span className="block text-xs text-ink-2 mt-0.5">{s.desc}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
