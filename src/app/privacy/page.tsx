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
            A message sent from the About page includes the email address and the text you type. AssetScore uses that
            message to reply. It is not published on the site.
          </p>
          <p>
            If you allow product counts, AssetScore records daily totals for site, homepage, registration, stock
            analysis, Stock Screener, pricing, and upgrade-button visits. It also records a small set of steps tied to
            your account: completed registration, trial start, first stock evaluation, first portfolio, an upgrade click,
            and a once-a-day note that a Free account was active. Those records do not include stock symbols, portfolio
            holdings, or payment amounts. Visit totals are not tied to a name. You can decline, and the site still
            works.
          </p>
          <p>
            When checkout starts, a paid plan starts, or a paid plan is canceled, AssetScore records that change against
            the account. That record is
            part of operating the subscription. It does not include the card or the amount charged. If you reached
            checkout from a Pro promotion and allowed product counts, the campaign name can be stored with that
            subscription event. The record does not include what you searched or which stocks you own.
          </p>
          <p>
            Free accounts may see AssetScore&apos;s own Pro promotions. Trial and paid Pro accounts do not. Those
            promotions are not from other companies. If you allow product counts, a view or a click stores the campaign,
            the page area, the time, and your account id when you are signed in. It does not store your email.
          </p>
          <p>
            These counts are not sold. They are used to see where people stop between visiting, registering, and
            subscribing. This notice describes the practices above for users in Canada, including Quebec. It is not a
            claim that every legal obligation has been independently certified. There is no delete button in the
            account page. To ask for access, correction, or deletion of the account, use the contact form on the About
            page. Deletion depends on removing the authentication account and the rows tied to it.
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
