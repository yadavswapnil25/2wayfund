import { Bell, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../state/AppContext";
import { monogram } from "../../lib/format";

export function Brandbar({ onToggleNav }: { onToggleNav: () => void }) {
  const { session, logout, store } = useApp();
  const [logoError, setLogoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const signedIn = Boolean(session.role);

  return (
    <header className="bg-white border-b-[3px] border-navy px-5.5">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-6 flex-wrap min-h-[74px] py-2.5">
        <button
          type="button"
          onClick={onToggleNav}
          aria-label="Menu"
          className="hidden max-[1000px]:inline-flex items-center justify-center bg-white border border-border text-ink text-base px-2 py-1 rounded"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-3">
          {!logoError ? (
            <img
              src="/logo.png"
              alt="2 Way Fund International"
              className="h-11 w-11 rounded-lg object-contain flex-none"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="h-11 w-11 rounded-lg bg-navy text-white font-bold text-[13px] flex items-center justify-center flex-none">
              2WF
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] font-bold text-navy leading-tight">2 Way Fund International</span>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Global Banking
              </span>
            </div>
            <div className="text-[10.5px] tracking-wide uppercase text-ink-2 mt-0.5">
              {session.role === "admin" ? "Compliance Console" : "Official Retail & Corporate NetBanking"}
            </div>
          </div>
        </div>

        {signedIn ? (
          <div className="flex items-center gap-3.5 flex-wrap">
            {session.role === "customer" ? (
              <Link
                to="/inbox"
                aria-label="Bank Notices"
                className="relative text-ink-2 border border-border-lt bg-white p-2 rounded-full hover:bg-tint"
              >
                <Bell size={14} />
              </Link>
            ) : null}

            <div className="flex items-center gap-2.5">
              {session.role === "customer" && !avatarError ? (
                <img
                  src="/user.jpg"
                  alt={session.display}
                  className="flex-none w-9 h-9 rounded-full object-cover border border-navy-lt/30"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="flex-none w-9 h-9 rounded-full bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk text-[12.5px] font-bold flex items-center justify-center border border-navy-lt/30">
                  {monogram(session.display)}
                </span>
              )}
              <div>
                <div className="text-[13px] font-bold text-ink leading-tight">{session.display}</div>
                <div className="text-[10.5px] text-ink-2">
                  {session.role === "customer" ? `CIF: ${store.user.reference}` : "Back office · Staff"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-neg border border-[#E3B8B0] bg-white px-3.5 py-1.5 rounded-full hover:bg-[#FDF6F4]"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
