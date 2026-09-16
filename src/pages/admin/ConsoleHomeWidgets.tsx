import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  KeyRound,
  ScrollText,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface QueueItem {
  label: string;
  count: number;
  sub: string;
  icon: LucideIcon;
  path?: string;
}

export interface ActivityEntry {
  at: string;
  who: string;
  what: string;
}

export interface LiveFigure {
  label: string;
  value: number | null;
  path: string;
}

const QUICK_ACTIONS: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "Open account", path: "/open-customer-account", icon: UserPlus },
  { label: "Review applications", path: "/admin", icon: ClipboardList },
  { label: "Customer accounts", path: "/customer-accounts", icon: Users },
];

const SHORTCUTS: { label: string; desc: string; path: string; icon: LucideIcon }[] = [
  { label: "Ledger adjustments", desc: "Maker–checker corrections to a ledger", path: "/adjustments", icon: ScrollText },
  { label: "Customer data maintenance", desc: "Amend a customer's recorded details", path: "/customer-data", icon: UserCog },
  { label: "Change password", desc: "Rotate your own staff credentials", path: "/admin-password", icon: KeyRound },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function WelcomeBanner({ operator, outstanding, figures }: { operator: string; outstanding: number; figures: LiveFigure[] }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-dk via-navy to-navy-lt text-white shadow-md mb-5">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 w-80 h-80 rounded-full border-[28px] border-white/5 pointer-events-none"
      />
      <div aria-hidden="true" className="absolute right-40 -bottom-28 w-64 h-64 rounded-full bg-gold/10 pointer-events-none" />

      <div className="relative grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{todayLabel()}</p>
          <h1 className="m-0 mt-1.5 text-[24px] sm:text-[27px] font-bold text-white! leading-tight">
            {greeting()}, {operator || "Operator"}
          </h1>
          <p className="m-0 mt-2 text-[13px] text-white/75 max-w-[60ch]">
            {outstanding > 0
              ? `${outstanding} ${outstanding === 1 ? "item is" : "items are"} waiting for a decision across the back-office queues.`
              : "Every queue is clear — nothing is waiting for a decision right now."}
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-navy px-3.5 py-2 text-[12.5px] font-semibold no-underline shadow-sm hover:bg-[#FBF3DE] transition-colors"
              >
                <a.icon size={15} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <dl className="m-0 grid grid-cols-2 gap-3 lg:min-w-[300px]">
          {figures.map((f) => (
            <Link
              key={f.label}
              to={f.path}
              className="block rounded-xl bg-white/10 border border-white/15 px-4 py-3.5 no-underline hover:bg-white/15 transition-colors"
            >
              <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-white/60">{f.label}</dt>
              <dd className="m-0 mt-1 font-num tabular-nums text-[26px] font-bold text-white leading-none">
                {f.value === null ? <span className="text-white/40">—</span> : f.value.toLocaleString("en-IN")}
              </dd>
            </Link>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function QueueTile({ item }: { item: QueueItem }) {
  const hasWork = item.count > 0;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex-none w-10 h-10 rounded-xl flex items-center justify-center ${
            hasWork ? "bg-[#FBF3DE] text-gold-dk" : "bg-[#EFF8F2] text-pos"
          }`}
        >
          <item.icon size={18} />
        </span>
        {hasWork ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF3DE] text-gold-dk text-[10.5px] font-semibold px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            Action needed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF8F2] text-pos text-[10.5px] font-semibold px-2 py-0.5">
            <CheckCircle2 size={11} />
            Clear
          </span>
        )}
      </div>

      <div className="mt-4">
        <span className="block font-num tabular-nums text-[30px] font-bold text-navy leading-none">{item.count}</span>
        <span className="block mt-2 text-[13px] font-semibold text-ink">{item.label}</span>
        <span className="block mt-0.5 text-[11.5px] text-ink-2">{hasWork ? item.sub : "Nothing outstanding"}</span>
      </div>

      {item.path ? (
        <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-navy-lt group-hover:gap-2 transition-all">
          View queue <ArrowRight size={13} />
        </span>
      ) : null}
    </>
  );

  const cls = `group flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
    hasWork ? "border-gold/40" : "border-border-lt"
  }`;

  return item.path ? (
    <Link to={item.path} className={`${cls} no-underline hover:border-navy-lt hover:shadow-md transition-all`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-center py-12 text-ink-2 text-[12.5px] m-0">No back-office activity yet.</p>;
  }
  return (
    <ol className="list-none m-0 p-0 relative">
      <span aria-hidden="true" className="absolute left-[34px] top-6 bottom-6 w-px bg-border-lt" />
      {entries.map((e, i) => (
        <li key={i} className="relative flex items-start gap-4 px-5 py-3.5 border-b border-border-lt last:border-b-0">
          <span className="relative z-10 flex-none w-8 h-8 rounded-full bg-tint border border-border-lt text-navy text-[10.5px] font-bold flex items-center justify-center">
            {initials(e.who)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[12.5px] text-ink leading-snug">
              <span className="font-semibold text-navy">{e.who}</span> <span className="text-ink-2">·</span> {e.what}
            </p>
            <span className="block mt-0.5 font-num text-[11px] text-ink-2">{e.at}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SessionCard({ operator, failures }: { operator: string; failures: number }) {
  const rows: [string, string][] = [
    ["Operator", operator || "—"],
    ["Environment", "Demo — no production data"],
    ["Signed in", "This browser tab only"],
    ["Failed attempts", String(failures)],
  ];
  return (
    <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border-lt flex items-center justify-between">
        <h3 className="m-0 text-[14.5px] font-bold text-navy">Session</h3>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-pos">
          <span className="w-1.5 h-1.5 rounded-full bg-pos" />
          Active
        </span>
      </div>
      <dl className="m-0 divide-y divide-border-lt">
        {rows.map(([k, v]) => (
          <div key={k} className="px-5 py-3">
            <dt className="text-[10.5px] uppercase tracking-wide text-ink-2 font-semibold">{k}</dt>
            <dd className="m-0 mt-0.5 text-[13px] font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ShortcutsCard() {
  return (
    <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border-lt">
        <h3 className="m-0 text-[14.5px] font-bold text-navy">Shortcuts</h3>
        <p className="m-0 mt-0.5 text-[11px] text-ink-2">Tools that aren't in the side menu</p>
      </div>
      <ul className="list-none m-0 p-0 divide-y divide-border-lt">
        {SHORTCUTS.map((s) => (
          <li key={s.path}>
            <Link to={s.path} className="flex items-center gap-3 px-5 py-3 no-underline hover:bg-tint transition-colors">
              <span className="flex-none w-8 h-8 rounded-lg bg-tint text-navy flex items-center justify-center">
                <s.icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-ink">{s.label}</span>
                <span className="block text-[11px] text-ink-2 truncate">{s.desc}</span>
              </span>
              <ArrowRight size={14} className="flex-none text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
