import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { ResetPasswordForm } from "@/components/auth-form";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Choose a password · AssetScore" };

export default async function ResetPasswordPage() {
  const { user } = await loadViewer();

  return (
    <AuthScreen
      kicker="Account"
      title="Choose a new password"
      copy={
        user
          ? "This replaces the password on your account."
          : "Open the reset link from your email, then choose a new password."
      }
    >
      {user ? <ResetPasswordForm /> : null}
    </AuthScreen>
  );
}
