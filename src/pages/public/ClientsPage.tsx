import { Link } from "react-router-dom";
import { PageHead } from "../../components/ui/Flow";
import { Panel, PanelBody, PanelHead } from "../../components/ui/Panel";
import { Callout, KV } from "../../components/ui/Misc";
import { monogram } from "../../lib/format";
import { CLIENTS, CLIENTS_INTRO, CONNECTING_STATEMENT, INDUSTRY_GROUPS } from "../../data/clientContent";

function ClientCard({ name, industry, description }: { name: string; industry: string; description: string }) {
  return (
    <div className="bg-white border border-border-lt rounded-lg p-4.5 shadow-sm flex gap-3.5">
      <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E8D6A8] to-gold text-navy-dk text-[11px] font-bold flex items-center justify-center flex-shrink-0">
        {monogram(name)}
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

      <Callout title="Every name on this page is invented" variant="warn" className="mt-5.5 mb-0">
        <p>
          Naming a real company as a client here would assert a business relationship that doesn't exist — misleading the moment it's
          seen out of context. Every organisation above is fictional, created for this prototype, and every "logo" is a generated
          monogram derived from the invented name, not fetched from anywhere. See{" "}
          <Link to="/company" className="text-navy-lt hover:underline">About Us</Link> for the institution these fictional clients are
          shown transacting through.
        </p>
      </Callout>
    </>
  );
}
