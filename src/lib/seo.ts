import type { Metadata } from "next";

const SITE = "https://assetscore.net";

const shareImage = {
  url: "/logo.png",
  width: 1353,
  height: 1353,
  alt: "AssetScore logo",
  type: "image/png" as const,
};

export function shareMetadata({
  title,
  description,
  path,
  robots,
}: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
}): Metadata {
  const url = path === "/" ? `${SITE}/` : `${SITE}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(robots ? { robots } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: "AssetScore",
      type: "website",
      images: [shareImage],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [shareImage.url],
    },
  };
}
