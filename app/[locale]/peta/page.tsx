import { getAllSchools } from "@/lib/schools";
import { SchoolMap } from "@/components/school-map";
import { MapSearch } from "@/components/map-search";
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
    <div className="w-full flex flex-col min-h-[calc(100vh-3.5rem)]">
      <div className="container mx-auto px-4 pt-6 pb-4 flex flex-col gap-3 shrink-0">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <div className="w-full max-w-md">
          <MapSearch schools={schools} />
        </div>
      </div>
      <div className="w-full overflow-hidden relative h-[70vh] min-h-[500px]">
        <SchoolMap schools={schools} highlightKod={kod || null} locale={locale} />
      </div>
    </div>
  );
}
