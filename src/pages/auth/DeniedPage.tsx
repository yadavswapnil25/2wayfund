export function DeniedPage() {
  return (
    <div className="max-w-[560px] mx-auto mt-5 border border-[#E0AEA7] bg-[#FDF6F4] border-l-4 border-l-neg px-5 py-4.5">
      <h2 className="mb-2.5 text-[15px] text-[#9E2D22] font-bold">Access denied</h2>
      <p className="mb-2.5 text-[12.5px] leading-relaxed">You do not have permission to view that page with your current session.</p>
      <p className="mb-2.5 text-[12.5px] leading-relaxed">
        In the prototype this check runs in the browser and is trivially bypassable — it demonstrates <em>where</em> role separation belongs in
        the design, not a security boundary. A production build enforces this server-side on every request, and never relies on the client
        hiding a page.
      </p>
    </div>
  );
}
