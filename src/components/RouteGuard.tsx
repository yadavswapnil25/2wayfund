import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../data/constants";
import { canAccess, landingFor } from "../lib/access";
import { useApp } from "../state/AppContext";
import { HomePage } from "../pages/public/HomePage";

/** Client-side only, and labelled as such on the page — this demonstrates
 * where role separation belongs in the design, not a security boundary.
 * A production build enforces this server-side on every request. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { session } = useApp();
  const location = useLocation();
  const entry = ROUTES.find((r) => r.path === location.pathname);

  if (!entry) return <Navigate to={landingFor(session.role)} replace />;

  const isLoginPage =
    entry.path === "/login" || entry.path === "/corporate-login" || entry.path === "/admin-login" || entry.path === "/register-account";
  if (session.role && isLoginPage) {
    return <Navigate to={landingFor(session.role)} replace />;
  }

  if (!canAccess(entry, session.role)) {
    if (!session.role) {
      // The root path is the app's front door for a visitor with no
      // session — render the public Home page in place, not straight into
      // a login form, and without changing the URL away from "/". Every
      // other customer/admin-only route means they were trying to reach
      // something specific, so login is still the right redirect there.
      if (entry.path === "/") return <HomePage />;
      return <Navigate to={entry.access === "admin" ? "/admin-login" : "/login"} replace />;
    }
    return <Navigate to="/denied" replace />;
  }

  return <>{children}</>;
}
