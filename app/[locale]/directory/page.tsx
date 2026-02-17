import {
  getAllSchools,
  getUniqueNegeri,
  getUniquePpd,
  getUniqueJenis,
  getUniqueLokasi,
} from "@/lib/schools";
import { SearchAndResults } from "@/components/search-and-results";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "directory" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function DirectoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const schools = getAllSchools();
  const negeriOptions = getUniqueNegeri();
  const ppdOptions = getUniquePpd();
  const jenisOptions = getUniqueJenis();
  const lokasiOptions = getUniqueLokasi();

  const t = await getTranslations("directory");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("databaseCountPrefix")}
        <strong>{schools.length}</strong>
        {t("databaseCountSuffix")}
      </p>
      <SearchAndResults
        schools={schools}
        negeriOptions={negeriOptions}
        ppdOptions={ppdOptions}
        jenisOptions={jenisOptions}
        lokasiOptions={lokasiOptions}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
