import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isProduction = process.env.NODE_ENV === "production";
let umamiOrigin = "";
try {
  const url = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  if (url) umamiOrigin = new URL(url).origin;
} catch {
  // ignore invalid URL
}

function buildCsp(): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'", // Next.js hydration
    "'unsafe-eval'",   // Next.js dev / some runtimes
    ...(umamiOrigin ? [umamiOrigin] : []),
  ].join(" ");
  const connectSrc = ["'self'", ...(umamiOrigin ? [umamiOrigin] : [])].join(" ");
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src " + connectSrc,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    const csp = buildCsp();
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: csp },
    ];
    if (isProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/:locale(en|ms)/sekolah/:kod", destination: "/:locale/:kod", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
