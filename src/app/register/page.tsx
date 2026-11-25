import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { RegisterForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Register · AssetScore" };

export default function RegisterPage() {
  return (
    <AuthScreen
      kicker="Account"
      title="Create an account"
      copy="Take control of your investments. Create your free account and unlock unlimited stock analysis and portfolio tools for 30 days. No credit card is required, and the trial does not charge you when it ends."
    >
      <RegisterForm />
    </AuthScreen>
  );
}
