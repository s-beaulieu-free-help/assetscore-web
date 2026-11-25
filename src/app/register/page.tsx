import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { RegisterForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Register · AssetScore" };

export default function RegisterPage() {
  return (
    <AuthScreen
      kicker="Account"
      title="Create an account"
      copy="Choose a display name. It is what other people see on your reviews. Your email stays private."
    >
      <RegisterForm />
    </AuthScreen>
  );
}
