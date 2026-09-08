import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../data/constants";
import { canAccess, landingFor } from "../lib/access";
import { useApp } from "../state/AppContext";

/** Client-side only, and labelled as such on the page — this demonstrates
 * where role separation belongs in the design, not a security boundary.
 * A production build enforces this server-side on every request. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { session } = useApp();
  const location = useLocation();
  const entry = ROUTES.find((r) => r.path === location.pathname);

  if (!entry) return <Navigate to={landingFor(session.role)} replace />;

  if (session.role && (entry.path === "/login" || entry.path === "/admin-login")) {
    return <Navigate to={landingFor(session.role)} replace />;
  }

  if (!canAccess(entry, session.role)) {
    if (!session.role) {
      return <Navigate to={entry.access === "admin" ? "/admin-login" : "/login"} replace />;
    }
    return <Navigate to="/denied" replace />;
  }

  return <>{children}</>;
}
