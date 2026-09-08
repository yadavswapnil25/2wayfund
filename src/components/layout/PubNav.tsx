import { Link, useLocation } from "react-router-dom";
import { PUBLIC_NAV } from "../../data/constants";

export function PubNav() {
  const location = useLocation();
  return (
    <nav className="bg-navy-dk px-5">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 flex-wrap py-1.5">
        <div className="flex flex-wrap items-stretch bg-white rounded-md overflow-hidden border border-white/25">
          {PUBLIC_NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap border-r border-[#DDE4EC] last:border-r-0 no-underline ${
                  active ? "bg-gradient-to-b from-[#D9AF57] to-gold text-navy-dk font-bold" : "text-navy hover:bg-[#F1F5FA]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/login" className="inline-block px-4 py-2 rounded-[5px] text-[12.5px] font-bold no-underline bg-transparent text-white border border-white/50">
            Sign In
          </Link>
          <Link
            to="/open-account"
            className="inline-block px-4 py-2 rounded-[5px] text-[12.5px] font-bold no-underline bg-gradient-to-b from-[#D9AF57] to-gold text-navy-dk border border-gold-dk"
          >
            Open an Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
