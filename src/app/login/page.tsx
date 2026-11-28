import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { LoginForm } from "@/components/auth-form";
import { safeAppPath } from "@/lib/safe-path";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Log in · AssetScore",
  description: "Log in to AssetScore. Portfolios, favorites, and reviews stay with the account. The first stock you open stays available without signing in.",
  path: "/login",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const nextPath = safeAppPath((await searchParams).next, "/screener");

  return (
    <AuthScreen
      kicker="Account"
      title="Log in"
      copy="Your portfolios, favorites, and reviews stay with your account. The first stock you open stays available without signing in."
    >
      <LoginForm nextPath={nextPath} />
    </AuthScreen>
  );
}
