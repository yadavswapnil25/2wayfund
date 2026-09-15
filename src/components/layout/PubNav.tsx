import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Building2, ChevronDown, Home, LayoutGrid, LogIn, Menu, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { PUBLIC_NAV_GROUPS, PUBLIC_NAV_PRIMARY, type PublicNavGroup } from "../../data/constants";

const NAV_ICONS: Record<string, LucideIcon> = {
  Home: Home,
  "About Us": Building2,
  Clients: Users,
  Services: LayoutGrid,
  "Security & Legal": ShieldCheck,
};

function NavLogo() {
  const [errored, setErrored] = useState(false);
  return (
    <Link to="/" className="flex-none flex items-center" aria-label="2 Way Fund International — Home">
      {!errored ? (
        <img src="/logo.png" alt="2 Way Fund International" className="h-12 w-auto object-contain" onError={() => setErrored(true)} />
      ) : (
        <span className="h-12 px-2 flex items-center rounded bg-navy text-white font-bold text-[12px]">2WF</span>
      )}
    </Link>
  );
}

const ITEM_BASE = "flex flex-col items-center gap-1 px-3.5 py-1.5 text-[11.5px] font-semibold whitespace-nowrap no-underline rounded-lg transition-colors";
const ITEM_ACTIVE = "bg-[#FBF3DE] text-navy";
const ITEM_INACTIVE = "text-ink-2 hover:bg-tint hover:text-navy";

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
        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-md text-[13px] font-bold bg-gradient-to-b from-navy-lt to-navy text-white shadow-sm hover:brightness-110"
      >
        <LogIn size={14} />
        Login
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
  const Icon = NAV_ICONS[group.label] ?? LayoutGrid;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className={`${ITEM_BASE} ${active ? ITEM_ACTIVE : ITEM_INACTIVE}`}>
        <Icon size={18} />
        <span className="flex items-center gap-0.5">
          {group.label}
          <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
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
    <nav className="bg-white sticky top-0 z-30 px-5 border-b border-border-lt shadow-sm">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-5">
          <NavLogo />
          <div className="hidden min-[900px]:flex items-center gap-1">
            {PUBLIC_NAV_PRIMARY.map((item) => {
              const Icon = NAV_ICONS[item.label] ?? Home;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`${ITEM_BASE} ${isActive ? ITEM_ACTIVE : ITEM_INACTIVE}`}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            {PUBLIC_NAV_GROUPS.map((group) => (
              <NavDropdown key={group.label} group={group} active={isGroupActive(group)} onNavigate={() => setMobileOpen(false)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="min-[900px]:hidden inline-flex items-center justify-center text-navy border border-border rounded px-2.5 py-1.5"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/register-account"
            className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-md text-[13px] font-bold no-underline bg-white text-navy border border-navy/30 hover:bg-tint"
          >
            <UserPlus size={14} />
            Register
          </Link>
          <SignInMenu onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {mobileOpen ? (
        <div className="min-[900px]:hidden border-t border-border-lt pb-3">
          {PUBLIC_NAV_PRIMARY.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-2 py-2.5 text-[13px] font-semibold no-underline border-b border-border-lt ${
                location.pathname === item.path ? "text-navy" : "text-ink-2"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {PUBLIC_NAV_GROUPS.map((group) => (
            <div key={group.label} className="border-b border-border-lt last:border-b-0">
              <p className="m-0 px-2 pt-3 pb-1 text-[10px] font-bold tracking-widest uppercase text-ink-2">{group.label}</p>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-2 py-2 text-[13px] font-semibold no-underline ${
                    location.pathname === item.path ? "text-navy" : "text-ink-2"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          <Link
            to="/register-account"
            onClick={() => setMobileOpen(false)}
            className="block mt-2 mx-2 px-4 py-2.5 rounded-md text-center text-[13px] font-bold no-underline bg-white text-navy border border-navy/30"
          >
            Register for Netbanking
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
