import { useState } from "react";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { KV } from "../../components/ui/Misc";
import { monogram } from "../../lib/format";
import { CLIENTS, CLIENTS_INTRO, CONNECTING_STATEMENT, INDUSTRY_GROUPS, type Client } from "../../data/clientContent";

function ClientCard({ name, industry, description, logo }: Client) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="bg-white border border-border-lt rounded-lg p-4.5 shadow-sm flex gap-3.5">
      <span className="w-14 h-14 rounded-lg border border-border-lt bg-white flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
        {logoFailed ? (
          <span className="w-full h-full rounded-md bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk text-[11px] font-bold flex items-center justify-center">
            {monogram(name)}
          </span>
        ) : (
          <img
            src={logo}
            alt={`${name} logo`}
            className="max-w-full max-h-full object-contain"
            onError={() => setLogoFailed(true)}
          />
        )}
      </span>
      <div className="min-w-0">
        <h3 className="text-[13px] mb-0.5">{name}</h3>
        <p className="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-ink-2">{industry}</p>
        <p className="m-0 text-xs text-ink-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function ClientsPage() {
  return (
    <>
      <PageHead title="Our Clients" lede="Global Businesses. International Connectivity." />

      <Panel>
        <PanelBody>
          <p className="m-0 text-[12.5px] text-ink-2 leading-relaxed">{CLIENTS_INTRO}</p>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Our Client Network" note={`${CLIENTS.length} organisations`} />
        <PanelBody>
          <div className="grid gap-4 sm:grid-cols-2">
            {CLIENTS.map((c) => (
              <ClientCard key={c.name} {...c} />
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHead title="Our Global Business Network" note="By industry" />
        <PanelBody>
          <KV items={INDUSTRY_GROUPS.map((g) => [g.label, g.members.join(", ")])} />
        </PanelBody>
      </Panel>

      <div className="bg-navy-dk text-white rounded-[10px] p-6.5 text-center">
        <p className="m-0 mb-2 text-[14px] text-white/90 max-w-[62ch] mx-auto leading-relaxed">{CONNECTING_STATEMENT}</p>
        <p className="m-0 text-[13px] text-gold font-bold uppercase tracking-wide">2 Way Fund International</p>
        <p className="m-0 mt-1 text-[12px] text-white/70">Connecting Countries. Converting Currencies. Enabling Global Payments.</p>
      </div>
    </>
  );
}
