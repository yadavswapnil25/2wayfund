import { Link } from "react-router-dom";
import { useMemo } from "react";
import { AlertTriangle, ArrowUpRightFromCircle, ClipboardList, FileCheck2, Inbox, ScrollText } from "lucide-react";
import { PageHead } from "../../components/ui/Flow";
import { useApp } from "../../state/AppContext";

interface Queue {
  label: string;
  count: number;
  sub: string;
  icon: typeof ClipboardList;
  path?: string;
}

export function ConsoleHomePage() {
  const { store, session } = useApp();

  const queues = useMemo<Queue[]>(() => {
    const docsReceived = store.applications.reduce(
      (t, a) => t + (a.kyc ? a.kyc.documents.filter((d) => d.status === "Received").length : 0),
      0
    );
    return [
      {
        label: "Applications",
        count: store.applications.filter((a) => a.status === "Submitted" || a.status === "Under review").length,
        sub: "Awaiting a compliance decision",
        icon: ClipboardList,
        path: "/admin",
      },
      { label: "eKYC documents", count: docsReceived, sub: "Received, awaiting adjudication", icon: FileCheck2, path: "/admin" },
      {
        label: "Ledger adjustments",
        count: store.adjustments.filter((a) => a.status === "Pending authorisation").length,
        sub: "Awaiting a second officer",
        icon: ScrollText,
        path: "/adjustments",
      },
      {
        label: "Data amendments",
        count: store.maintenance.filter((m) => m.status === "Pending authorisation").length,
        sub: "Awaiting a second officer",
        icon: ArrowUpRightFromCircle,
        path: "/customer-data",
      },
      {
        label: "Unallocated credits",
        count: store.inbound.filter((i) => i.status === "Unallocated").length,
        sub: "Inbound, not yet matched",
        icon: Inbox,
      },
      {
        label: "Held transactions",
        count: store.transactions.filter((t) => t.status === "Under review" && !t.reversed).length,
        sub: "Screened, awaiting release",
        icon: AlertTriangle,
      },
    ];
  }, [store.applications, store.adjustments, store.maintenance, store.inbound, store.transactions]);

  const activity = useMemo(() => {
    const feed: { at: string; who: string; what: string }[] = [];

    store.applications.forEach((a) => {
      a.audit.forEach((e) => {
        if (e.actor === "Applicant") return;
        feed.push({ at: e.at, who: e.actor, what: `${a.ref} — ${e.action}` });
      });
    });
    store.adjustments.forEach((a) => {
      feed.push({ at: a.raisedAt, who: a.maker, what: `${a.ref} raised — ${a.reason}` });
      if (a.decidedAt) feed.push({ at: a.decidedAt, who: a.checker ?? "—", what: `${a.ref} ${a.status.toLowerCase()}` });
    });
    store.maintenance.forEach((m) => {
      feed.push({ at: m.raisedAt, who: m.maker, what: `${m.ref} raised — ${m.label}` });
      if (m.decidedAt) feed.push({ at: m.decidedAt, who: m.checker ?? "—", what: `${m.ref} ${m.status.toLowerCase()}` });
    });

    return feed.slice(0, 40);
  }, [store.applications, store.adjustments, store.maintenance]);

  return (
    <>
      <PageHead title="Console Home" lede="Back-office landing page — what is waiting, who is signed in, and the most recent decisions." />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-5">
        {queues.map((q) => {
          const hasWork = q.count > 0;
          const body = (
            <>
              <span
                className={`flex-none w-9 h-9 rounded-xl flex items-center justify-center ${
                  hasWork ? "bg-[#FBF4E1] text-amber" : "bg-[#EFF8F2] text-pos"
                }`}
              >
                <q.icon size={16} />
              </span>
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-ink-2 truncate">{q.label}</span>
                <span className="block font-num tabular-nums text-[20px] font-bold text-navy leading-tight">{q.count}</span>
                <span className="block text-[10.5px] text-ink-2 truncate">{hasWork ? q.sub : "Nothing outstanding"}</span>
              </div>
            </>
          );
          const cls = "flex items-start gap-3 rounded-2xl border border-border-lt bg-white px-4 py-3.5 shadow-sm";
          return q.path ? (
            <Link key={q.label} to={q.path} className={`${cls} no-underline hover:border-navy-lt transition-colors`}>
              {body}
            </Link>
          ) : (
            <div key={q.label} className={cls}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 mb-5 min-[1001px]:grid-cols-[280px_minmax(0,1fr)] items-start">
        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4.5 py-4 border-b border-border-lt">
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Session</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">{session.display || "Not signed in"}</p>
          </div>
          <div className="divide-y divide-border-lt">
            {[
              ["Operator", session.display || "—"],
              ["Environment", "Demo — no production data"],
              ["Signed in", "This browser tab only"],
            ].map(([k, v]) => (
              <div key={k} className="px-4.5 py-3">
                <span className="block mb-0.5 text-[10.5px] uppercase tracking-wide text-ink-2 font-semibold">{k}</span>
                <p className="m-0 text-[13px] font-semibold text-ink">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4.5 sm:px-5 py-4 border-b border-border-lt">
            <h3 className="m-0 text-[14.5px] font-bold text-navy">Recent Activity</h3>
            <p className="m-0 mt-0.5 text-[11px] text-ink-2">{activity.length} {activity.length === 1 ? "entry" : "entries"}</p>
          </div>
          {activity.length === 0 ? (
            <p className="text-center py-10 text-ink-2 text-[12.5px]">No back-office activity yet.</p>
          ) : (
            <ol className="list-none m-0 divide-y divide-border-lt">
              {activity.map((e, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4.5 sm:px-5 py-2.5 text-[12px]">
                  <span className="font-num text-ink-2 w-[130px] flex-none">{e.at}</span>
                  <span className="font-semibold text-navy">{e.who}</span>
                  <span className="text-ink">{e.what}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}
