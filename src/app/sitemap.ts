import type { MetadataRoute } from "next";
import { LEARN_ARTICLES } from "@/lib/learn-articles";
import { RANKING_PAGES, rankingSymbols } from "@/lib/rankings";
import { TOPIC_PAGES } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = ["", "/pricing", "/methodology", "/coverage", "/reports", "/about", "/privacy", "/terms", "/learn", "/topics", "/screener"];
  return [
    ...pages.map((path) => ({
      url: `https://assetscore.net${path || "/"}`,
      lastModified,
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path === "/topics" ? 0.8 : 0.7,
    })),
    ...LEARN_ARTICLES.map((article) => ({
      url: `https://assetscore.net/learn/${article.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...TOPIC_PAGES.map((topic) => ({
      url: `https://assetscore.net/topics/${topic.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...RANKING_PAGES.map((page) => ({
      url: `https://assetscore.net/rankings/${page.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: page.slug === "sp500" ? 0.9 : 0.8,
    })),
    ...rankingSymbols().map((symbol) => ({
      url: `https://assetscore.net/stocks/${symbol}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
