import { getAllSchools } from "@/lib/schools";
import { SchoolMap } from "@/components/school-map";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ kod?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "map" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MapPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const { kod } = await searchParams;
  const schools = getAllSchools();
  const t = await getTranslations("map");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("hint")}</p>
      <SchoolMap schools={schools} highlightKod={kod || null} locale={locale} />
    </div>
  );
}
