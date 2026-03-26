import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <head>
        {/* Anti-FOUC: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script defer src={`${umamiScriptUrl}`} data-website-id={umamiWebsiteId}></script>
      </head>
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {umamiScriptUrl && umamiWebsiteId && (
          <Script
            src={`${umamiScriptUrl.replace(/\/$/, "")}/script.js`}
            data-website-id={umamiWebsiteId}
            strategy="beforeInteractive"
          />
        )}
        {children}
      </body>
    </html>
  );
}
