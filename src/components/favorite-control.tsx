import { loadAccess } from "@/lib/billing/access";
import { FavoriteButton } from "@/components/favorite-button";
import { loadViewer } from "@/lib/viewer";

export async function FavoriteControl({ ticker }: { ticker: string }) {
  const [{ supabase, user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  let initialFavorite = false;
  if (supabase && user) {
    const { data } = await supabase
      .from("favorite_stocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("ticker", ticker)
      .maybeSingle();
    initialFavorite = Boolean(data);
  }

  return (
    <FavoriteButton
      ticker={ticker}
      signedIn={Boolean(user)}
      initialFavorite={initialFavorite}
      canAdd={access.canAddFavorite}
    />
  );
}
