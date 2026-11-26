import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/auth/", "/favorites", "/onboarding", "/portfolios", "/promotions/"],
    },
    sitemap: "https://assetscore.net/sitemap.xml",
    host: "https://assetscore.net",
  };
}
