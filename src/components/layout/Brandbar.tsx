import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../state/AppContext";
import { monogram } from "../../lib/format";
import { NotificationsMenu } from "./NotificationsMenu";

export function Brandbar({ onToggleNav }: { onToggleNav: () => void }) {
  const { session, logout, store, photoUrl } = useApp();
  const [logoError, setLogoError] = useState(false);
  const signedIn = Boolean(session.role);
  const isAdmin = session.role === "admin";

  return (
    <header className="bg-white border-b-2 border-navy px-5.5">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 min-h-[58px] py-1.5">
        <div className="flex items-center gap-3 min-w-0">
          {signedIn ? (
            <button
              type="button"
              onClick={onToggleNav}
              aria-label="Menu"
              className="hidden max-[1000px]:inline-flex items-center justify-center bg-white border border-border text-ink px-2 py-1 rounded"
            >
              <Menu size={16} />
            </button>
          ) : null}

          {!logoError ? (
            <img
              src="/logo-mark.png"
              alt="2 Way Fund International"
              className="h-10 w-10 object-contain flex-none"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-navy text-white font-bold text-[13px] flex items-center justify-center flex-none">
              2WF
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap leading-none">
              <span className="text-[15.5px] font-bold text-navy truncate">2 Way Fund International</span>
              <span className="hidden sm:inline-block text-[9.5px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                Global Banking
              </span>
            </div>
            <div className="text-[10px] tracking-wide uppercase text-ink-2 mt-0.5 leading-none">
              {isAdmin ? "Application Console" : "Official Retail & Corporate"}
            </div>
          </div>
        </div>

        {signedIn ? (
          <div className="flex items-center gap-2 flex-none">
            {session.role === "customer" ? <NotificationsMenu /> : null}

            <div className="flex items-center gap-2 rounded-full border border-border-lt bg-tint pl-1 pr-3 py-1">
              {session.role === "customer" && photoUrl ? (
                <img src={photoUrl} alt={session.display} className="flex-none w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="flex-none w-7 h-7 rounded-full bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk text-[11px] font-bold flex items-center justify-center">
                  {monogram(session.display)}
                </span>
              )}
              <div className="hidden sm:block leading-tight">
                <div className="text-[12px] font-bold text-ink">{session.display}</div>
                <div className="text-[10px] text-ink-2">
                  {session.role === "customer" ? `CIF: ${store.user.reference}` : "Back office · Staff"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-neg border border-[#E3B8B0] bg-white px-3 py-1.5 rounded-full hover:bg-[#FDF6F4]"
            >
              <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
