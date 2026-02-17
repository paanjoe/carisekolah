import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { AlertTriangle, ExternalLink } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "facility" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FacilityPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return null;
  }
  setRequestLocale(locale);

  const t = await getTranslations("facility");

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
      <p className="text-sm text-muted-foreground font-medium mb-6">{t("comingSoonHeading")}</p>

      <p className="leading-relaxed text-foreground mb-6">{t("intro")}</p>

      <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 mb-6">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-200">{t("disclaimerTitle")}</p>
          <p className="text-sm text-amber-800/90 dark:text-amber-200/90 mt-0.5">{t("disclaimer")}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <a
          href="https://projekdaif.moe.gov.my/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          {t("kpmLinkLabel")}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </p>
    </div>
  );
}
