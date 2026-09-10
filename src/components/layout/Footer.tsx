import { Link } from "react-router-dom";

const FOOT_LINKS: { label: string; path: string }[] = [
  { label: "Home", path: "/home" },
  { label: "About Us", path: "/company" },
  { label: "Clients", path: "/clients" },
  { label: "Account Services", path: "/account-services" },
  { label: "Card Services", path: "/card-services" },
  { label: "Exchange Services", path: "/exchange-services" },
  { label: "Currency Exchange", path: "/exchange" },
  { label: "Fee Policy", path: "/fee-policy" },
  { label: "Fees & Charges", path: "/fees" },
  { label: "About KYC", path: "/security" },
  { label: "Transaction Security", path: "/transaction-security" },
  { label: "e-Security", path: "/e-security" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Account Types", path: "/accounts" },
  { label: "Apply for an Account", path: "/open-account" },
  { label: "eKYC", path: "/ekyc" },
];

export function Footer() {
  return (
    <footer className="bg-navy-dk text-[#9FB6CB] mt-7.5">
      <div className="max-w-[1440px] mx-auto px-5.5 py-6.5 text-[11.5px] leading-relaxed">
        <p className="mb-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5">
          {FOOT_LINKS.map((l) => (
            <Link key={l.path} to={l.path} className="text-[#CBDAE8] no-underline hover:underline">
              {l.label}
            </Link>
          ))}
        </p>
        <p className="m-0 mb-2">
          <strong>2 Way Fund International</strong> — design prototype. Fictional entity, fictional data, no financial service provided. Prepared as a
          system-design case study; not for use in any real transaction.
        </p>
        <p className="m-0">
          Most pages here run entirely in your browser and make no network requests. Opening an account submits your application to a
          demonstration backend for this case study — no real account is opened, no funds are collected and no identity documents are
          requested. Authentication is mocked with credentials printed on the login screens — never enter a real password into a prototype.
        </p>
      </div>
    </footer>
  );
}
