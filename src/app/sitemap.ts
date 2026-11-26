import type { MetadataRoute } from "next";
import { RANKING_PAGES, rankingSymbols } from "@/lib/rankings";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = ["", "/pricing", "/methodology", "/about", "/privacy", "/terms", "/learn", "/screener"];
  return [
    ...pages.map((path) => ({
      url: `https://assetscore.net${path || "/"}`,
      lastModified,
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...RANKING_PAGES.map((page) => ({
      url: `https://assetscore.net/rankings/${page.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...rankingSymbols().map((symbol) => ({
      url: `https://assetscore.net/stocks/${symbol}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
