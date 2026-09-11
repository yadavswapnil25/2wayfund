import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useApp } from "../../state/AppContext";
import { Brandbar } from "./Brandbar";
import { PubNav } from "./PubNav";
import { Breadcrumbs, SessionBar } from "./Breadcrumbs";
import { Sidenav } from "./Sidenav";
import { Footer } from "./Footer";

// "/corporate-login" is deliberately not here — unlike the other auth
// screens it's a wide two-column layout (form + informational panels), not
// a narrow centered card, so it keeps the ordinary breadcrumb/full-width
// treatment every other public page gets.
const AUTH_PATHS = ["/login", "/admin-login", "/register-account", "/denied"];

export function AppShell() {
  const { session } = useApp();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const signedIn = Boolean(session.role);
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Brandbar onToggleNav={() => setNavOpen((v) => !v)} />
      {!signedIn ? <PubNav /> : null}
      <SessionBar />
      {!isAuthPage ? <Breadcrumbs /> : null}

      <div
        className={
          isAuthPage || !signedIn
            ? "max-w-[1360px] w-full mx-auto px-5.5 py-4.5 pb-12 flex-1"
            : "max-w-[1360px] w-full mx-auto px-5.5 py-4.5 pb-12 grid gap-5.5 flex-1 min-[1001px]:grid-cols-[248px_minmax(0,1fr)]"
        }
      >
        {signedIn && !isAuthPage ? <Sidenav open={navOpen} /> : null}
        <main className="min-w-0">
          {isAuthPage ? (
            <div className="max-w-[420px] mx-auto mt-10">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
