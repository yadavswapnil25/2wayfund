export function Flow({ steps, numbered = true }: { steps: string[]; numbered?: boolean }) {
  return (
    <ol className="list-none flex flex-wrap items-center gap-0 p-0 m-0">
      {steps.map((step, i) => (
        <li key={i} className="flex items-center">
          <div className="flex items-center gap-1.5 bg-tint border border-border-lt rounded-full px-3 py-1.5 text-[12px] text-ink">
            {numbered ? (
              <span className="w-4.5 h-4.5 rounded-full bg-navy text-white text-[9.5px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
            ) : null}
            <span>{step}</span>
          </div>
          {i < steps.length - 1 ? <span className="mx-1.5 text-ink-2">›</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function Chain({ nodes }: { nodes: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nodes.map((node, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-navy-dk text-white text-[11.5px] font-semibold px-3 py-1.5 rounded">{node}</span>
          {i < nodes.length - 1 ? <span className="text-ink-2">›</span> : null}
        </span>
      ))}
    </div>
  );
}

export function PageHead({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="mb-4.5">
      <h1 className="text-[23px]">{title}</h1>
      <p className="mt-1.5 text-ink-2 text-[12.5px] max-w-[96ch]">{lede}</p>
    </div>
  );
}
