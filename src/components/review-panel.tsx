"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Stars } from "@/components/stars";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { reviewRejectionReason } from "@/lib/moderation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export type ReviewItem = {
  id: string;
  userId: string;
  name: string;
  rating: number;
  text: string | null;
  status: string;
  createdAt: string;
};

const sorts = [
  { id: "relevant", label: "Most relevant" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "highest", label: "Highest rating" },
] as const;

type SortId = (typeof sorts)[number]["id"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function ReviewPanel({
  ticker,
  signedIn,
  canReview = true,
  average,
  count,
  reviews,
  own,
}: {
  ticker: string;
  signedIn: boolean;
  canReview?: boolean;
  average: number | null;
  count: number;
  reviews: ReviewItem[];
  own: ReviewItem | null;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortId>("relevant");
  const [rating, setRating] = useState(own?.rating ?? 0);
  const [text, setText] = useState(own?.text ?? "");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const ordered = useMemo(() => {
    const rows = [...reviews];
    if (sort === "newest") rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "oldest") rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sort === "highest") rows.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    if (sort === "relevant") {
      rows.sort((a, b) => {
        const textRank = Number(Boolean(b.text?.trim())) - Number(Boolean(a.text?.trim()));
        if (textRank !== 0) return textRank;
        return b.createdAt.localeCompare(a.createdAt);
      });
    }
    return rows;
  }, [reviews, sort]);

  async function save() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (rating < 1 || rating > 5) {
      setMessage("Choose a rating from 1 to 5 stars.");
      return;
    }
    if (text.length > 200) {
      setMessage("The written review must be 200 characters or fewer.");
      return;
    }
    const localReason = reviewRejectionReason(text);
    setPending(true);
    setMessage("");
    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      router.push("/login");
      return;
    }
    const payload = {
      user_id: user.id,
      ticker,
      rating,
      review_text: text.trim() || null,
      moderation_status: "pending",
    };
    const result = own
      ? await supabase.from("stock_reviews").update(payload).eq("id", own.id).eq("user_id", user.id)
      : await supabase.from("stock_reviews").insert(payload);
    setPending(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    const { data: reason } = await supabase.rpc("review_rejection_reason", { body: text.trim() });
    setMessage(
      typeof reason === "string"
        ? reason
        : localReason ?? "Your review was saved. Approved reviews appear in the community rating.",
    );
    router.refresh();
  }

  async function remove() {
    if (!own || !window.confirm("Delete your review of this stock?")) return;
    setPending(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.from("stock_reviews").delete().eq("id", own.id);
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setRating(0);
    setText("");
    setMessage("Your review was deleted.");
    router.refresh();
  }

  return (
    <section className="mt-4 rounded-2xl border border-line bg-card p-6 sm:p-8">
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Community</p>
      <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">What readers think</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        This rating is separate from the AssetScore. It is the average of approved reviews and is not used in the financial score.
      </p>
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <Stars value={average ?? 0} label={average == null ? "No community rating yet" : `${average.toFixed(1)} out of 5`} />
        <p className="font-mono text-sm text-muted tabular-nums">
          {average == null ? "No approved reviews yet" : `${average.toFixed(1)} · ${count} approved`}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {sorts.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSort(option.id)}
            className={`rounded-full border px-3 py-1.5 text-[13px] ${
              sort === option.id ? "border-accent text-accent" : "border-line text-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {sort === "relevant" ? (
        <p className="mt-3 text-xs leading-5 text-muted">
          Most relevant means a written review comes before a rating with no text. Newer reviews come first within each group.
        </p>
      ) : null}

      <ul className="mt-6 divide-y divide-line">
        {ordered.length === 0 ? (
          <li className="py-4 text-sm text-muted">No reviews to show yet.</li>
        ) : (
          ordered.map((review) => (
            <li key={review.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium">{review.name}</p>
                <p className="font-mono text-xs text-muted">{formatDate(review.createdAt)}</p>
              </div>
              <div className="mt-2">
                <Stars value={review.rating} />
              </div>
              {review.text ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{review.text}</p> : null}
              {review.status !== "approved" ? (
                <p className="mt-2 text-xs tracking-[0.12em] text-muted uppercase">{review.status}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>

      <div className="mt-8 border-t border-line pt-8">
        {signedIn && canReview ? (
          <div>
            <h3 className="text-lg font-medium tracking-[-0.03em]">{own ? "Your review" : "Write a review"}</h3>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-xl ${value <= rating ? "text-accent" : "text-white/25"}`}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
              placeholder="Optional. Up to 200 characters."
              className="mt-4 w-full rounded-xl border border-line bg-white/[0.03] px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-white/20"
            />
            <p className="mt-2 text-xs text-muted">{text.length}/200</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink disabled:opacity-60"
              >
                {pending ? "Saving…" : own ? "Update review" : "Submit review"}
              </button>
              {own ? (
                <button type="button" onClick={remove} className="text-sm text-muted hover:text-foreground">
                  Delete review
                </button>
              ) : null}
            </div>
          </div>
        ) : signedIn ? (
          <p className="text-sm leading-6 text-muted">
            Writing reviews is included with Pro. Pro is {PRO_MONTHLY_PRICE.label}. Approved reviews stay visible.{" "}
            <Link href="/pricing" className="text-foreground hover:text-accent">
              Upgrade to Pro
            </Link>
            .
          </p>
        ) : (
          <p className="text-sm leading-6 text-muted">
            <Link href="/login" className="text-foreground hover:text-accent">
              Log in
            </Link>{" "}
            to rate this stock. Reading approved reviews does not require an account.
          </p>
        )}
        <p aria-live="polite" className="mt-3 min-h-5 text-[13px] leading-5 text-muted">
          {message}
        </p>
      </div>
    </section>
  );
}
