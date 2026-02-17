import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Optional: enable static export for GitHub Pages
  // output: 'export',
};

export default withNextIntl(nextConfig);
