import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { VisitBeacon } from "@/components/visit-beacon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://assetscore.net"),
  title: {
    default: "AssetScore · Stock analysis, evaluation, and scoring",
    template: "%s",
  },
  description:
    "A stock analysis platform for individual investors. Evaluate a US-listed company with a 0–100 AssetScore for value, growth, quality, financial health, and momentum.",
  applicationName: "AssetScore",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "AssetScore · Stock analysis, evaluation, and scoring",
    description:
      "A stock analysis platform for individual investors. Evaluate a US-listed company with a 0–100 AssetScore for value, growth, quality, financial health, and momentum.",
    url: "https://assetscore.net",
    siteName: "AssetScore",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1353,
        height: 1353,
        alt: "AssetScore logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "AssetScore · Stock analysis, evaluation, and scoring",
    description:
      "A stock analysis platform for individual investors. Evaluate a US-listed company with a 0–100 AssetScore for value, growth, quality, financial health, and momentum.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#090a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <VisitBeacon />
        <AnalyticsConsent />
      </body>
    </html>
  );
}
