import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Optional: enable static export for GitHub Pages
  // output: 'export',
  async redirects() {
    return [
      { source: "/:locale(en|ms)/sekolah/:kod", destination: "/:locale/:kod", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
