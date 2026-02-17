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
  const t = await getTranslations({ locale, namespace: "pageStats" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const umamiShareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

export default async function PageStatisticsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations("pageStats");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground max-w-3xl">{t("intro")}</p>
        {umamiShareUrl ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <iframe
              title={t("title")}
              src={umamiShareUrl}
              className="w-full min-h-[640px] border-0"
              allow="fullscreen"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <p className="text-muted-foreground">{t("embedNotConfigured")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              See <code className="rounded bg-muted px-1.5 py-0.5 text-xs">docs/UMAMI.md</code> for setup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
