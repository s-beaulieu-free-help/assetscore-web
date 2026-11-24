import { Coverage } from "@/components/coverage";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopRated } from "@/components/top-rated";

export default function Home() {
  return (
    <div id="top">
      <SiteHeader />
      <main>
        <Hero />
        <TopRated />
        <Features />
        <Coverage />
      </main>
      <SiteFooter />
    </div>
  );
}
