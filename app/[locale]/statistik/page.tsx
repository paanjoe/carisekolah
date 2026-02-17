import { getAllSchools } from "@/lib/schools";
import { StatsDashboard } from "@/components/stats-dashboard";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { AlertTriangle } from "lucide-react";

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
        <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">{t("disclaimerTitle")}</p>
            <p className="text-sm text-amber-800/90 dark:text-amber-200/90 mt-0.5">{t("disclaimer")}</p>
          </div>
        </div>
        <StatsDashboard schools={schools} />
      </div>
    </div>
  );
}
