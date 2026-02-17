import type { MetadataRoute } from "next";
import { getAllSchools } from "@/lib/schools";
import { routing } from "@/i18n/routing";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const schools = getAllSchools();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    const prefix = `${BASE}/${locale}`;
    entries.push(
      { url: prefix, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${prefix}/peta`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${prefix}/statistik`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${prefix}/compare`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${prefix}/facility`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${prefix}/page-statistics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 }
    );
    for (const s of schools) {
      entries.push({
        url: `${prefix}/${encodeURIComponent(s.kodSekolah)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }
  }
  return entries;
}
