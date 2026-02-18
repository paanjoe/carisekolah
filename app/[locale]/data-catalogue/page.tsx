import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "dataCatalogue" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function DataCataloguePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations("dataCatalogue");

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button asChild size="lg" className="shrink-0">
              <a
                href="/api/schools/export"
                download="schools.json"
                className="inline-flex items-center gap-2"
              >
                <Download className="h-5 w-5" aria-hidden />
                {t("downloadSchools")}
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">{t("downloadHint")}</p>
          </div>
          <p className="text-sm text-muted-foreground">{t("fieldsNote")}</p>
        </div>
      </div>
    </div>
  );
}
