import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../data/constants";
import { useApp } from "../../state/AppContext";

const LAST_LOGIN_LABEL = "02 Sep 2026, 09:14 IST";

/** One thin strip under the topbar: the breadcrumb trail on the left and,
 * once someone is signed in, the session facts on the right — so the
 * session line no longer costs a whole row of its own. */
export function Breadcrumbs() {
  const { session } = useApp();
  const location = useLocation();
  // An unauthenticated visitor at "/" sees the Home page rendered in place
  // (see RouteGuard) with the URL left at "/" — the crumb must reflect
  // what's actually on screen, not the "/" route's own (customer-only) entry.
  const crumbPath = !session.role && location.pathname === "/" ? "/home" : location.pathname;
  const entry = ROUTES.find((r) => r.path === crumbPath);
  const crumbs = (entry?.crumb ?? "").split(" › ").filter(Boolean);

  return (
    <div className="bg-tint border-b border-border-lt">
      <div className="max-w-[1360px] mx-auto px-5.5 py-1.5 text-[11.5px] text-ink-2 flex items-center justify-between gap-3 flex-wrap">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
          <Link to="/" className="text-ink-2 no-underline hover:text-navy">
            Home
          </Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              <span className="text-border">›</span>
              <span className={i === crumbs.length - 1 ? "text-navy font-semibold truncate" : "truncate"}>{c}</span>
            </span>
          ))}
        </nav>

        {session.role ? (
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span>
              Last login <strong className="text-ink font-semibold">{LAST_LOGIN_LABEL}</strong>
            </span>
            <span className="text-border">|</span>
            <span>
              Failed attempts{" "}
              <strong className={`font-semibold ${session.failures > 0 ? "text-neg" : "text-ink"}`}>{session.failures}</strong>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
