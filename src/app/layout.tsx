import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
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
  title: "AssetScore — Score any investment in seconds",
  description:
    "AssetScore transforms complex financial data into a simple score that helps investors identify opportunities faster.",
  applicationName: "AssetScore",
  openGraph: {
    title: "AssetScore — Score any investment in seconds",
    description:
      "AssetScore transforms complex financial data into a simple score that helps investors identify opportunities faster.",
    url: "https://assetscore.net",
    siteName: "AssetScore",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080c",
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
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
