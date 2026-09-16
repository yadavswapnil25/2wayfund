import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRightFromCircle, ClipboardList, FileCheck2, Inbox, ScrollText } from "lucide-react";
import { useApp } from "../../state/AppContext";
import { listCustomerAccounts } from "../../services/adminAccountService";
import { listApplications } from "../../services/applicationService";
import {
  ActivityTimeline,
  QueueTile,
  SessionCard,
  ShortcutsCard,
  WelcomeBanner,
  type ActivityEntry,
  type LiveFigure,
  type QueueItem,
} from "./ConsoleHomeWidgets";

const ACTIVITY_LIMIT = 12;

interface LiveTotals {
  customers: number | null;
  applications: number | null;
}

/** Real headline totals from the API — rendered as "—" until they land,
 * and left that way (rather than failing the page) if the fetch can't. */
function useLiveTotals(token: string | undefined): LiveTotals {
  const [totals, setTotals] = useState<LiveTotals>({ customers: null, applications: null });

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const { signal } = controller;

    void Promise.allSettled([
      listCustomerAccounts(token, {}, signal),
      listApplications(token, {}, signal),
    ]).then(([accounts, applications]) => {
      if (signal.aborted) return;
      setTotals({
        customers: accounts.status === "fulfilled" ? accounts.value.meta.total : null,
        applications: applications.status === "fulfilled" ? applications.value.meta.total : null,
      });
    });

    return () => controller.abort();
  }, [token]);

  return totals;
}

export function ConsoleHomePage() {
  const { store, session } = useApp();
  const live = useLiveTotals(session.token);

  const queues = useMemo<QueueItem[]>(() => {
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

  const outstanding = useMemo(() => queues.reduce((t, q) => t + q.count, 0), [queues]);

  const activity = useMemo<ActivityEntry[]>(() => {
    const feed: ActivityEntry[] = [];

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

    return feed.slice(0, ACTIVITY_LIMIT);
  }, [store.applications, store.adjustments, store.maintenance]);

  const figures: LiveFigure[] = [
    { label: "Customer accounts", value: live.customers, path: "/customer-accounts" },
    { label: "Applications on file", value: live.applications, path: "/admin" },
  ];

  return (
    <>
      <WelcomeBanner operator={session.display} outstanding={outstanding} figures={figures} />

      <section className="mb-5">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="m-0 text-[16px] font-bold text-navy">Work queue</h2>
          <span className="text-[11.5px] text-ink-2">
            {outstanding} outstanding · {queues.filter((q) => q.count === 0).length} of {queues.length} clear
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {queues.map((q) => (
            <QueueTile key={q.label} item={q} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 mb-5 min-[1001px]:grid-cols-[minmax(0,1fr)_300px] items-start">
        <section className="bg-white border border-border-lt rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border-lt flex items-baseline justify-between gap-3">
            <div>
              <h2 className="m-0 text-[14.5px] font-bold text-navy">Recent decisions</h2>
              <p className="m-0 mt-0.5 text-[11px] text-ink-2">Latest back-office actions, newest first</p>
            </div>
            <span className="text-[11px] text-ink-2 font-num">{activity.length} shown</span>
          </div>
          <ActivityTimeline entries={activity} />
        </section>

        <div className="grid gap-5">
          <SessionCard operator={session.display} failures={session.failures} />
          <ShortcutsCard />
        </div>
      </div>
    </>
  );
}
