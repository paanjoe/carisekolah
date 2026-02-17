import { getAllSchools } from "@/lib/schools";
import { StatsDashboard } from "@/components/stats-dashboard";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "statistics" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function StatistikPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const schools = getAllSchools();
  const t = await getTranslations("statistics");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground max-w-3xl">{t("intro")}</p>
        <StatsDashboard schools={schools} />
      </div>
    </div>
  );
}
