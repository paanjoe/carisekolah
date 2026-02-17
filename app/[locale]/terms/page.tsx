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
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations("terms");

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("intro")}</p>

      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">{t("useOfService")}</h2>
        <p>{t("useOfServiceText")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("noWarranty")}</h2>
        <p>{t("noWarrantyText")}</p>
      </section>
    </div>
  );
}
