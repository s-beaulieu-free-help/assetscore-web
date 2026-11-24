import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className}`} />;
}

export default function StockLoading() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24" aria-busy="true" aria-live="polite">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Loading market data</p>
        <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Block className="h-12 w-40 rounded-xl" />
            <Block className="mt-3 h-5 w-64 rounded-md" />
          </div>
          <Block className="h-10 w-36 rounded-xl" />
        </div>
        <Block className="mt-10 h-72" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Block key={index} className="h-24" />
          ))}
        </div>
        <Block className="mt-4 h-72" />
      </main>
      <SiteFooter />
    </div>
  );
}
