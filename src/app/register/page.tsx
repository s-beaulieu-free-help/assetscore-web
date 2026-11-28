import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { RegisterForm } from "@/components/auth-form";
import { recordDailyCount } from "@/lib/analytics";
import { tickerFromStockPath } from "@/lib/guest-stock";
import { safeAppPath } from "@/lib/safe-path";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Create a free account · AssetScore",
  description:
    "Create a free AssetScore account. The 30-day trial includes unlimited stock evaluations, the Stock Screener, portfolios, and stock comparisons. No credit card.",
  path: "/register",
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await recordDailyCount("registration_page_view");
  const nextPath = safeAppPath((await searchParams).next);
  const returnTicker = tickerFromStockPath(nextPath);

  return (
    <AuthScreen
      kicker="Account"
      title="Create an account"
      copy={
        returnTicker
          ? `Create a free account to open another company. After you confirm your email, you'll come back to ${returnTicker}. No credit card, and the trial does not charge you when it ends.`
          : "Create your free account. For 30 days you can run unlimited stock evaluations, use the Stock Screener, create portfolios, and compare stocks."
      }
      points={[
        "Unlimited stock evaluations.",
        "Stock Screener for the S&P 500, Nasdaq 100, and Dow Jones.",
        "New portfolios and allocation-weighted scores.",
        "Stock comparisons.",
        "New favorites and reviews.",
        "No AssetScore ads during the trial. No credit card. No automatic charge.",
      ]}
    >
      <RegisterForm nextPath={nextPath} />
    </AuthScreen>
  );
}
