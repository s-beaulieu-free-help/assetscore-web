import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy · AssetScore",
  description: "What AssetScore stores about accounts, subscriptions, and product counts.",
};

export default function PrivacyPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Privacy</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">What we keep</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted">
          <p>
            AssetScore stores the account details you provide: email, display name, password through the authentication
            provider, portfolios, favorites, and reviews. Subscription status is stored so the server can decide which
            features your account can use. Card numbers are handled by Stripe and are not stored by AssetScore.
          </p>
          <p>
            If you allow product counts, AssetScore records a daily total of homepage and registration-page visits, and
            a small set of steps tied to your account: completed registration, first stock evaluation, first portfolio,
            and a once-a-day note that a Free account was active. Those records do not include stock symbols, portfolio
            holdings, or payment amounts. Visit totals are not tied to a name. You can decline, and the site still
            works.
          </p>
          <p>
            When a paid plan starts or is canceled, AssetScore records that change against the account. That record is
            part of operating the subscription. It does not include the card or the amount charged.
          </p>
          <p>
            These counts are not sold. They are used to see where people stop between visiting, registering, and
            subscribing. This notice is written for users in Canada, including Quebec&apos;s privacy requirements. You
            can review the events attached to your account by asking from the address on your profile, and deleting the
            account removes them.
          </p>
          <p>
            <Link href="/account" className="text-foreground hover:text-accent">
              Account settings
            </Link>{" "}
            include the current plan, trial date, price, next billing date, and cancellation status.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
