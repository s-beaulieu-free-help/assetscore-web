import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { LoginForm } from "@/components/auth-form";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Log in · AssetScore",
  description: "Log in to AssetScore. Portfolios, favorites, and reviews stay with the account. Stock scores stay available without signing in.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthScreen
      kicker="Account"
      title="Log in"
      copy="Your portfolios, favorites, and reviews stay with your account. Stock scores remain available without signing in."
    >
      <LoginForm />
    </AuthScreen>
  );
}
