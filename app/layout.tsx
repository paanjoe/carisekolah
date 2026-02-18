import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carisekolah.civictech.my";

export const metadata: Metadata = {
  title: "carisekolahmy | Cari Sekolah",
  description: "Cari dan analisis sekolah KPM mengikut lokasi dan statistik.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "carisekolahmy | KPM School Finder",
    description: "Search and analyse KPM schools by location and statistics. Malaysia.",
    url: siteUrl,
    siteName: "carisekolahmy",
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "carisekolahmy | KPM School Finder",
    description: "Search and analyse KPM schools by location and statistics. Malaysia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        {children}
        {umamiScriptUrl && umamiWebsiteId && (
          <Script
            src={`${umamiScriptUrl.replace(/\/$/, "")}/script.js`}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
