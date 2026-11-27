import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LEARN_ARTICLES, learnArticle } from "@/lib/learn-articles";
import { shareMetadata } from "@/lib/seo";

type LearnArticleProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: LearnArticleProps): Promise<Metadata> {
  const article = learnArticle((await params).slug);
  if (!article) return { title: "Learn · AssetScore" };
  return shareMetadata({
    title: `${article.title} · AssetScore`,
    description: article.description,
    path: `/learn/${article.slug}`,
  });
}

export default async function LearnArticlePage({ params }: LearnArticleProps) {
  const article = learnArticle((await params).slug);
  if (!article) notFound();
  const url = `https://assetscore.net/learn/${article.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AssetScore", item: "https://assetscore.net/" },
          { "@type": "ListItem", position: 2, name: "Learn", item: "https://assetscore.net/learn" },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "AssetScore", url: "https://assetscore.net/" },
        publisher: { "@type": "Organization", name: "AssetScore", url: "https://assetscore.net/" },
      },
    ],
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">{article.kicker}</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{article.title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted">
          {article.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-8 text-sm leading-7 text-muted">
          These notes match the stock page. They describe the latest figures. They are not a forecast and they are not
          investment advice.
        </p>
        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Related">
          {article.related.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground hover:text-accent">
              {link.label}
            </Link>
          ))}
          <Link href="/learn" className="text-foreground hover:text-accent">
            All articles
          </Link>
        </nav>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteFooter />
    </div>
  );
}
