import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { PUBLIC_NAV_GROUPS, PUBLIC_NAV_PRIMARY, type PublicNavGroup } from "../../data/constants";

const LINK_BASE = "px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap no-underline rounded-[5px]";
const LINK_ACTIVE = "bg-gradient-to-b from-[#D9AF57] to-gold text-navy-dk font-bold";
const LINK_INACTIVE = "text-white/85 hover:bg-white/10 hover:text-white";

const SIGN_IN_OPTIONS = [
  { label: "Internet Banking", path: "/login" },
  { label: "Corporate Internet Banking", path: "/corporate-login" },
];

function SignInMenu({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1 px-4 py-2 rounded-[5px] text-[12.5px] font-bold bg-transparent text-white border border-white/50"
      >
        Sign In
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+12px)] w-[240px] bg-white border border-border-lt rounded-lg shadow-lg p-3 flex flex-col gap-2.5 z-40 before:content-[''] before:absolute before:-top-2 before:right-5 before:w-4 before:h-4 before:bg-white before:border-l before:border-t before:border-border-lt before:rotate-45"
        >
          {SIGN_IN_OPTIONS.map((opt) => (
            <Link
              key={opt.label}
              to={opt.path}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
              className="block text-center px-4 py-2.5 rounded-md border border-[#3B6EA5] text-[#2F5C93] text-[12.5px] font-semibold no-underline hover:bg-[#EAF1F9]"
            >
              {opt.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavDropdown({ group, active, onNavigate }: { group: PublicNavGroup; active: boolean; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${LINK_BASE} flex items-center gap-1 ${active ? LINK_ACTIVE : LINK_INACTIVE}`}
      >
        {group.label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] min-w-[220px] bg-white border border-border-lt rounded-md shadow-lg overflow-hidden z-40">
          {group.items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
              className="block px-4 py-2.5 text-[12.5px] font-semibold text-navy no-underline border-b border-border-lt last:border-b-0 hover:bg-tint"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PubNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const isGroupActive = (group: PublicNavGroup) => group.items.some((item) => item.path === location.pathname);

  return (
    <nav className="bg-navy-dk sticky top-0 z-30 px-5 shadow-sm">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 py-2.5">
        <div className="hidden min-[900px]:flex items-center gap-1">
          {PUBLIC_NAV_PRIMARY.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${LINK_BASE} ${location.pathname === item.path ? LINK_ACTIVE : LINK_INACTIVE}`}
            >
              {item.label}
            </Link>
          ))}
          {PUBLIC_NAV_GROUPS.map((group) => (
            <NavDropdown key={group.label} group={group} active={isGroupActive(group)} onNavigate={() => setMobileOpen(false)} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="min-[900px]:hidden inline-flex items-center justify-center text-white border border-white/40 rounded px-2.5 py-1.5"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="flex gap-2 flex-wrap">
          <SignInMenu onNavigate={() => setMobileOpen(false)} />
          <Link
            to="/register-account"
            className="inline-block px-4 py-2 rounded-[5px] text-[12.5px] font-bold no-underline bg-transparent text-white border border-white/50"
          >
            Register for Netbanking
          </Link>
          <Link
            to="/open-account"
            className="inline-block px-4 py-2 rounded-[5px] text-[12.5px] font-bold no-underline bg-gradient-to-b from-[#D9AF57] to-gold text-navy-dk border border-gold-dk"
          >
            Apply for an Account
          </Link>
        </div>
      </div>

      {mobileOpen ? (
        <div className="min-[900px]:hidden border-t border-white/15 pb-3">
          {PUBLIC_NAV_PRIMARY.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-2 py-2.5 text-[13px] font-semibold no-underline border-b border-white/10 ${
                location.pathname === item.path ? "text-gold" : "text-white/85"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {PUBLIC_NAV_GROUPS.map((group) => (
            <div key={group.label} className="border-b border-white/10 last:border-b-0">
              <p className="m-0 px-2 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase text-white/50">{group.label}</p>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-2 py-2 text-[13px] font-semibold no-underline ${
                    location.pathname === item.path ? "text-gold" : "text-white/85"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
