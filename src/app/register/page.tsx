import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { RegisterForm } from "@/components/auth-form";
import { recordDailyCount } from "@/lib/analytics";
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

  return (
    <AuthScreen
      kicker="Account"
      title="Create an account"
      copy="Create your free account. For 30 days you can run unlimited stock evaluations, use the Stock Screener, create portfolios, and compare stocks."
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
