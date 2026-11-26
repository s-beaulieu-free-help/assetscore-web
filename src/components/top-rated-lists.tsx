const lists = ["S&P 500", "Nasdaq 100", "Dow Jones"];

export function TopRatedLists() {
  return (
    <section id="top-rated" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Rankings</p>
        <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
          Top Rated
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
          These lists are published from the daily ranking.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {lists.map((list) => (
            <article key={list} className="rounded-2xl border border-line bg-card px-6 py-7">
              <h3 className="text-xl font-medium tracking-[-0.03em]">{list}</h3>
              <p className="mt-4 text-sm leading-6 text-muted">No ranking has been published yet.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
