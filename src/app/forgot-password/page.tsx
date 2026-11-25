import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { ForgotPasswordForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Reset password · AssetScore" };

export default function ForgotPasswordPage() {
  return (
    <AuthScreen
      kicker="Account"
      title="Reset your password"
      copy="We will email you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
