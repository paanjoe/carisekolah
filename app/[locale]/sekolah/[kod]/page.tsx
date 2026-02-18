import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchoolByKod } from "@/lib/schools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; kod: string }> };

// Return [] so school pages are rendered on-demand (keeps Vercel deploy under 75 MB)
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, kod } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const school = getSchoolByKod(decodeURIComponent(kod));
  const t = await getTranslations({ locale, namespace: "schoolDetail" });
  if (!school) return { title: t("notFound") };
  return {
    title: `${school.namaSekolah || school.kodSekolah} | carisekolah.my`,
    description: `${school.negeri} · ${school.ppd}. ${school.bandar || ""} ${school.poskod || ""}`,
  };
}

export default async function SchoolPage({ params }: Props) {
  const { locale, kod } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const school = getSchoolByKod(decodeURIComponent(kod));
  if (!school) notFound();

  const t = await getTranslations("schoolDetail");
  const tCommon = await getTranslations("common");
  const mapUrl = `/peta?kod=${encodeURIComponent(school.kodSekolah)}`;
  const ratio =
    typeof school.guru === "number" && school.guru > 0 && typeof school.enrolmen === "number"
      ? (school.enrolmen / school.guru).toFixed(1)
      : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
          {t("backToSearch")}
        </Link>
        <Link href={mapUrl}>
          <Button variant="outline" size="sm">
            {tCommon("viewOnMap")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{school.namaSekolah || school.kodSekolah}</CardTitle>
          <p className="text-muted-foreground">{t("code")}: {school.kodSekolah}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h3 className="font-medium mb-2">{t("address")}</h3>
            <p>
              {school.alamat}
              {school.bandar && `, ${school.bandar}`}
              {school.poskod && ` ${school.poskod}`}
            </p>
          </section>
          <section>
            <h3 className="font-medium mb-2">{t("authority")}</h3>
            <p>{school.negeri} · {school.ppd}</p>
            {school.parlimen && <p>{t("parliament")}: {school.parlimen}</p>}
            {school.dun && <p>{t("dun")}: {school.dun}</p>}
          </section>
          <section>
            <h3 className="font-medium mb-2">{t("contact")}</h3>
            {school.telefon && <p>{t("phone")}: {school.telefon}</p>}
            {school.fax && school.fax !== "TIADA" && <p>{t("fax")}: {school.fax}</p>}
            {school.email && (
              <p>
                {t("email")}:{" "}
                <a href={`mailto:${school.email}`} className="text-primary hover:underline">
                  {school.email}
                </a>
              </p>
            )}
          </section>
          <section>
            <h3 className="font-medium mb-2">{t("stats")}</h3>
            <ul className="space-y-1 text-sm">
              <li>{t("type")}: {school.jenis}</li>
              <li>{t("level")}: {school.peringkat}</li>
              <li>{t("location")}: {school.lokasi}</li>
              <li>{t("grade")}: {school.gred}</li>
              <li>{t("session")}: {school.sesi}</li>
              {school.enrolmen != null && <li>{t("enrolment")}: {school.enrolmen}</li>}
              {school.enrolmenPrasekolah != null && (
                <li>{t("preSchoolEnrolment")}: {school.enrolmenPrasekolah}</li>
              )}
              {school.enrolmenKhas != null && school.enrolmenKhas > 0 && (
                <li>{t("specialEnrolment")}: {school.enrolmenKhas}</li>
              )}
              {school.guru != null && <li>{t("teachers")}: {school.guru}</li>}
              {ratio != null && (
                <li>{t("studentTeacherRatio")}: {ratio}</li>
              )}
            </ul>
          </section>
          {school.lat != null && school.lng != null && (
            <p className="text-muted-foreground text-sm">
              {t("coordinates")}: {school.lat}, {school.lng}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
