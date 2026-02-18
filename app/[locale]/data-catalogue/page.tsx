import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyableCodeBlock } from "@/components/copyable-code";

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

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("sampleModelTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("sampleModelDescription")}</p>
          <CopyableCodeBlock
            content={JSON.stringify(SAMPLE_SCHOOL, null, 2)}
            copyLabel={t("copyJson")}
            copiedLabel={t("copied")}
          />
        </section>
      </div>
    </div>
  );
}

/** Example school object matching the schools.json array item structure */
const SAMPLE_SCHOOL = {
  negeri: "JOHOR",
  ppd: "PPD BATU PAHAT",
  parlimen: "PARIT SULONG",
  dun: "SEMERAH",
  peringkat: "Rendah",
  jenis: "SK",
  kodSekolah: "JBA0001",
  namaSekolah: "SEKOLAH KEBANGSAAN LUBOK",
  alamat: "KG. LUBOK,  SEMERAH",
  poskod: "83600",
  bandar: "BATU PAHAT",
  telefon: "074164398",
  fax: "074164398",
  email: "jba0001@moe.edu.my",
  lokasi: "Luar Bandar",
  gred: "C",
  bantuan: "SK",
  bilSesi: "1 Sesi",
  sesi: "Pagi Sahaja",
  enrolmenPrasekolah: 11,
  enrolmen: 68,
  enrolmenKhas: 29,
  guru: 20,
  prasekolah: "ADA",
  integrasi: "ADA",
  lng: 102.7954003,
  lat: 1.874099179,
  skmUnder150: "YA",
} as const;
