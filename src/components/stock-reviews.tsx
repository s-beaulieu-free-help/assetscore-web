import { ReviewPanel, type ReviewItem } from "@/components/review-panel";
import { loadViewer, viewerName } from "@/lib/viewer";

export async function StockReviews({ ticker }: { ticker: string }) {
  const { supabase, user, profile } = await loadViewer();
  if (!supabase) return null;

  const [{ data: summary }, { data: approved }, ownResult] = await Promise.all([
    supabase.from("stock_review_summary").select("average_rating, review_count").eq("ticker", ticker).maybeSingle(),
    supabase
      .from("stock_reviews")
      .select("id, user_id, rating, review_text, moderation_status, created_at")
      .eq("ticker", ticker)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("stock_reviews")
          .select("id, user_id, rating, review_text, moderation_status, created_at")
          .eq("ticker", ticker)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const ids = Array.from(
    new Set([...(approved ?? []).map((review) => review.user_id), ownResult.data?.user_id].filter(Boolean)),
  ) as string[];
  const names = new Map<string, string>();
  if (ids.length) {
    const view = await supabase.from("public_profiles").select("id, display_name").in("id", ids);
    const rows = view.error
      ? (await supabase.from("profiles").select("id, display_name").in("id", ids)).data
      : view.data;
    for (const row of rows ?? []) {
      names.set(row.id, row.display_name?.trim() || "Member");
    }
  }
  if (user) names.set(user.id, viewerName(profile));

  const toItem = (review: NonNullable<typeof ownResult.data>): ReviewItem => ({
    id: review.id,
    userId: review.user_id,
    name: names.get(review.user_id) || "Member",
    rating: review.rating,
    text: review.review_text,
    status: review.moderation_status,
    createdAt: review.created_at,
  });

  const reviews = (approved ?? []).map(toItem);
  const own = ownResult.data ? toItem(ownResult.data) : null;
  const visible = own && own.status !== "approved" ? [own, ...reviews.filter((review) => review.id !== own.id)] : reviews;

  return (
    <ReviewPanel
      ticker={ticker}
      signedIn={Boolean(user)}
      average={summary?.average_rating == null ? null : Number(summary.average_rating)}
      count={summary?.review_count == null ? 0 : Number(summary.review_count)}
      reviews={visible}
      own={own}
    />
  );
}
