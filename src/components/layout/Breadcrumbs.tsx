import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../data/constants";
import { useApp } from "../../state/AppContext";

export function Breadcrumbs() {
  const { session } = useApp();
  const location = useLocation();
  // An unauthenticated visitor at "/" sees the Home page rendered in place
  // (see RouteGuard) with the URL left at "/" — the crumb must reflect
  // what's actually on screen, not the "/" route's own (customer-only) entry.
  const crumbPath = !session.role && location.pathname === "/" ? "/home" : location.pathname;
  const entry = ROUTES.find((r) => r.path === crumbPath);
  return (
    <div className="bg-tint border-b border-border-lt">
      <div className="max-w-[1360px] mx-auto px-5.5 py-2 text-[11.5px] text-ink-2">
        <Link to="/" className="text-ink-2 no-underline">
          Home
        </Link>{" "}
        <span>› {entry?.crumb ?? ""}</span>
      </div>
    </div>
  );
}

export function SessionBar() {
  const { session } = useApp();
  if (!session.role) return null;
  return (
    <div className="bg-white border-b border-border-lt">
      <div className="max-w-[1360px] mx-auto px-5.5 py-1.5 text-[11.5px] text-ink-2 flex gap-2 flex-wrap">
        <span>
          Signed in as <strong className="text-ink font-semibold">{session.display}</strong>
        </span>
        <span className="text-border">|</span>
        <span>
          Last logged in: <strong className="text-ink font-semibold">02 Sep 2026, 09:14 IST</strong>
        </span>
        <span className="text-border">|</span>
        <span>
          Failed attempts: <strong className="text-ink font-semibold">{session.failures}</strong>
        </span>
      </div>
    </div>
  );
}
