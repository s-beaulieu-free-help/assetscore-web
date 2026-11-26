"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ScoreGauge } from "@/components/score-gauge";
import { allocationTotal, weightedPortfolioScore } from "@/lib/portfolio-score";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { parseTicker } from "@/lib/stocks";

export type HoldingView = {
  id: string;
  ticker: string;
  allocation: number;
  name: string;
  score: number | null;
  band: string | null;
  pillars: { label: string; score: number | null }[];
};

const inputClass =
  "h-11 rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-foreground outline-none focus:border-white/20";

export function PortfolioEditor({
  id,
  name,
  status,
  canEdit,
  holdings,
}: {
  id: string;
  name: string;
  status: string;
  canEdit: boolean;
  holdings: HoldingView[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const total = allocationTotal(holdings.map((holding) => holding.allocation));
  const remaining = Math.max(0, Math.round((100 - total) * 10000) / 10000);
  const weighted = weightedPortfolioScore(holdings);
  const locked = status === "complete";

  async function run(task: () => PromiseLike<{ error: { message: string } | null }>, success: string) {
    setPending(true);
    setMessage("");
    const result = await task();
    setPending(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setMessage(success);
    router.refresh();
  }

  async function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!nextName) return;
    const supabase = createSupabaseBrowser();
    await run(
      () => supabase.from("portfolios").update({ name: nextName }).eq("id", id),
      "Portfolio name saved.",
    );
  }

  async function addStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const ticker = parseTicker(String(data.get("ticker") ?? ""));
    const allocation = Number(data.get("allocation"));
    if (!ticker) {
      setMessage("Use a US ticker such as AAPL or MSFT.");
      return;
    }
    if (!Number.isFinite(allocation) || allocation <= 0 || allocation > 100) {
      setMessage("Allocation must be greater than 0 and no more than 100%.");
      return;
    }
    const supabase = createSupabaseBrowser();
    await run(async () => {
      const result = await supabase.from("portfolio_stocks").insert({ portfolio_id: id, ticker, allocation });
      if (!result.error) form.reset();
      return result;
    }, `${ticker} added.`);
  }

  async function saveAllocation(holdingId: string, allocation: number) {
    if (!Number.isFinite(allocation) || allocation <= 0 || allocation > 100) {
      setMessage("Allocation must be greater than 0 and no more than 100%.");
      return;
    }
    const supabase = createSupabaseBrowser();
    await run(
      () => supabase.from("portfolio_stocks").update({ allocation }).eq("id", holdingId),
      "Allocation saved.",
    );
  }

  async function removeHolding(holdingId: string) {
    if (!window.confirm("Remove this stock from the portfolio?")) return;
    const supabase = createSupabaseBrowser();
    await run(() => supabase.from("portfolio_stocks").delete().eq("id", holdingId), "Stock removed.");
  }

  async function complete() {
    if (Math.round(total * 10000) !== 1_000_000) {
      setMessage(`Allocations total ${total.toFixed(2)}%. The remaining ${remaining.toFixed(2)}% must be assigned first.`);
      return;
    }
    const supabase = createSupabaseBrowser();
    await run(
      () => supabase.rpc("complete_portfolio", { p_portfolio_id: id }),
      "Portfolio marked complete.",
    );
  }

  async function reopen() {
    const supabase = createSupabaseBrowser();
    await run(() => supabase.from("portfolios").update({ status: "draft" }).eq("id", id), "Portfolio reopened as a draft.");
  }

  return (
    <div>
      <section className="mt-10 grid items-center gap-4 rounded-2xl border border-line bg-card px-6 py-8 lg:grid-cols-[220px_1fr] lg:px-10">
        <div className="flex justify-center">
          {weighted.score == null ? (
            <p className="max-w-40 text-center text-sm text-muted">Score incomplete</p>
          ) : (
            <ScoreGauge score={weighted.score} size={180} id={id} />
          )}
        </div>
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Portfolio score</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
            {weighted.score == null ? "Incomplete" : `${weighted.score} of 100`}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {weighted.reason ??
              "The score is the allocation-weighted average of each stock's AssetScore. It uses the same stock scores as the dashboard."}
          </p>
          <p className="mt-4 font-mono text-sm text-muted tabular-nums">
            {holdings.length} stock{holdings.length === 1 ? "" : "s"} · Total allocation {total.toFixed(2)}% · Remaining{" "}
            {remaining.toFixed(2)}% · {status === "complete" ? "Complete" : "Incomplete"}
          </p>
        </div>
      </section>

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {holdings.length === 0 ? (
          <li className="px-6 py-6 text-sm text-muted">No stocks in this portfolio yet.</li>
        ) : (
          holdings.map((holding) => (
            <li key={holding.id} className="px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/stocks/${holding.ticker}`} className="text-lg font-medium hover:text-accent">
                    {holding.ticker}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{holding.name}</p>
                  <p className="mt-3 text-sm text-muted">
                    {holding.pillars.map((pillar) => `${pillar.label} ${pillar.score ?? "—"}`).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-sm tabular-nums">
                    {holding.score == null ? "Score unavailable" : `${holding.score} ${holding.band}`}
                  </p>
                  {canEdit && !locked ? (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const allocation = Number(new FormData(event.currentTarget).get("allocation"));
                        void saveAllocation(holding.id, allocation);
                      }}
                    >
                      <input
                        name="allocation"
                        type="number"
                        min="0.0001"
                        max="100"
                        step="0.0001"
                        defaultValue={holding.allocation}
                        aria-label={`${holding.ticker} allocation`}
                        className={`${inputClass} w-28`}
                      />
                      <span className="text-sm text-muted">%</span>
                      <button type="submit" className="text-sm text-foreground hover:text-accent">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeHolding(holding.id)}
                        className="text-sm text-muted hover:text-foreground"
                      >
                        Remove
                      </button>
                    </form>
                  ) : (
                    <p className="font-mono text-sm tabular-nums">{holding.allocation.toFixed(2)}%</p>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {canEdit ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {locked ? (
            <section className="rounded-2xl border border-line bg-card p-6">
              <h3 className="text-lg font-medium">Completed portfolio</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Stocks and allocations are locked. Reopen it as a draft to make changes.
              </p>
              <button
                type="button"
                onClick={() => void reopen()}
                disabled={pending}
                className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
              >
                Reopen as draft
              </button>
            </section>
          ) : (
            <section className="rounded-2xl border border-line bg-card p-6">
              <h3 className="text-lg font-medium">Add a stock</h3>
              <form onSubmit={addStock} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input name="ticker" placeholder="Ticker" className={`${inputClass} flex-1`} />
                <input
                  name="allocation"
                  type="number"
                  min="0.0001"
                  max="100"
                  step="0.0001"
                  placeholder="%"
                  className={`${inputClass} w-full sm:w-28`}
                />
                <button type="submit" disabled={pending} className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-ink">
                  Add
                </button>
              </form>
              <form onSubmit={rename} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input name="name" defaultValue={name} className={`${inputClass} flex-1`} />
                <button type="submit" className="h-11 rounded-full border border-line px-5 text-sm">
                  Rename
                </button>
              </form>
              <button
                type="button"
                onClick={() => void complete()}
                disabled={pending}
                className="mt-4 inline-flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
              >
                Mark complete
              </button>
            </section>
          )}
          <section className="rounded-2xl border border-line bg-card p-6">
            <h3 className="text-lg font-medium">Allocation</h3>
            <p className="mt-3 font-mono text-sm tabular-nums text-muted">
              Total allocation: {total.toFixed(2)}%
              <br />
              Remaining allocation: {remaining.toFixed(2)}%
              <br />
              Status: {status === "complete" ? "Complete" : "Incomplete"}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              A portfolio stays a draft until the allocations add up to 100% and you mark it complete.
            </p>
          </section>
        </div>
      ) : null}
      <p aria-live="polite" className="mt-4 min-h-5 text-[13px] leading-5 text-muted">
        {message}
      </p>
    </div>
  );
}

export function CreatePortfolioForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    if (!name) return;
    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data, error } = await supabase
      .from("portfolios")
      .insert({ user_id: user.id, name, is_public: false, status: "draft" })
      .select("id")
      .single();
    if (error || !data) {
      setMessage(error?.message ?? "The portfolio could not be created.");
      return;
    }
    form.reset();
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "first_portfolio_created" }),
    });
    router.push(`/portfolios/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
      <input name="name" placeholder="Portfolio name" className={`${inputClass} flex-1`} />
      <button type="submit" className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-ink">
        Create portfolio
      </button>
      {message ? <p className="text-sm text-[#f0a3a8]">{message}</p> : null}
    </form>
  );
}

export function DeletePortfolioButton({ id }: { id: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function remove() {
    if (!window.confirm("Delete this portfolio and its stocks?")) return;
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("portfolios").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/portfolios");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <button type="button" onClick={remove} className="text-sm text-muted hover:text-foreground">
        Delete portfolio
      </button>
      {message ? <p className="mt-2 text-[13px] text-[#f0a3a8]">{message}</p> : null}
    </div>
  );
}
