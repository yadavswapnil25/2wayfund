import { NavLink } from "react-router-dom";
import { NAV_GROUPS, ROUTES } from "../../data/constants";
import { canAccess } from "../../lib/access";
import { useApp } from "../../state/AppContext";

export function Sidenav({ open }: { open: boolean }) {
  const { session } = useApp();

  return (
    <nav
      className={`bg-white border border-border-lt rounded-md overflow-hidden sticky top-3.5 self-start max-h-[calc(100vh-28px)] overflow-y-auto ${
        open ? "block" : "block max-[1000px]:hidden"
      } max-[1000px]:static max-[1000px]:mb-4`}
      aria-label="Primary"
    >
      {NAV_GROUPS.map((group) => {
        // Services are public marketing/policy pages, not back-office tools —
        // staff have no reason to see them in the operations rail.
        if (group === "Services" && session.role === "admin") return null;
        let items = ROUTES.filter((r) => r.tab && r.group === group && canAccess(r, session.role));
        // Within Services specifically, a signed-in customer's rail is
        // pared down to eKYC only — the marketing/policy pages there are
        // reached from the public site, not the banking dashboard. Accounts,
        // Transfers and Cards are untouched — those are the actual dashboard.
        if (group === "Services" && session.role === "customer") {
          items = items.filter((r) => r.path === "/ekyc");
        }
        if (items.length === 0) return null;
        return (
          <div key={group} className="border-b border-border-lt last:border-b-0">
            <p className="m-0 px-3.5 pt-2.5 pb-1.5 text-[10px] font-bold tracking-widest uppercase text-ink-2">{group}</p>
            {items.map((r) => (
              <NavLink
                key={r.path}
                to={r.path}
                className={({ isActive }) =>
                  `block px-3.5 py-2 text-[12.5px] border-l-[3px] no-underline ${
                    isActive ? "bg-panel-head border-l-gold font-bold text-navy" : "border-l-transparent text-ink hover:bg-tint"
                  }`
                }
              >
                {r.tab}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
