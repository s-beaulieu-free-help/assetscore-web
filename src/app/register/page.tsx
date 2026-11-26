import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { RegisterForm } from "@/components/auth-form";
import { recordDailyCount } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Register · AssetScore",
  description: "Create a free AssetScore account and unlock unlimited stock analysis and portfolio tools for 30 days.",
};

export default async function RegisterPage() {
  await recordDailyCount("registration_page_view");

  return (
    <AuthScreen
      kicker="Account"
      title="Create an account"
      copy="Take control of your investments. Create your free account and unlock unlimited stock analysis and portfolio tools for 30 days."
      points={[
        "Unlimited stock evaluations.",
        "Full portfolio analysis.",
        "Stock comparisons.",
        "Advanced financial analysis.",
        "No advertisements during the trial.",
        "Full access. No credit card required. No automatic charge.",
      ]}
    >
      <RegisterForm />
    </AuthScreen>
  );
}
