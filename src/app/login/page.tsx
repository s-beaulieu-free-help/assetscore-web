import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { LoginForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in · AssetScore" };

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
