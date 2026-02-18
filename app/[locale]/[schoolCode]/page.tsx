import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchoolByKod, getAllSchools, getSchoolComparisonStats } from "@/lib/schools";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { SchoolHeader } from "@/components/school-detail/SchoolHeader";
import { SchoolAtAGlance } from "@/components/school-detail/SchoolAtAGlance";
import { SchoolMeaningfulStats } from "@/components/school-detail/SchoolMeaningfulStats";
import { SchoolAddressCard } from "@/components/school-detail/SchoolAddressCard";
import { SchoolContactCard } from "@/components/school-detail/SchoolContactCard";
import { SchoolAuthorityCard } from "@/components/school-detail/SchoolAuthorityCard";
import { SchoolQuickFacts } from "@/components/school-detail/SchoolQuickFacts";

type Props = { params: Promise<{ locale: string; schoolCode: string }> };

const IDEAL_CLASS_SIZE = 30;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, schoolCode } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const school = getSchoolByKod(decodeURIComponent(schoolCode));
  const t = await getTranslations({ locale, namespace: "schoolDetail" });
  if (!school) return { title: t("notFound") };
  return {
    title: `${school.namaSekolah || school.kodSekolah} | carisekolahmy`,
    description: `${school.negeri} · ${school.ppd}. ${school.bandar || ""} ${school.poskod || ""}. ${school.jenis}.`,
  };
}

export default async function SchoolHomePage({ params }: Props) {
  const { locale, schoolCode } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const school = getSchoolByKod(decodeURIComponent(schoolCode));
  if (!school) notFound();

  const t = await getTranslations("schoolDetail");
  const tCommon = await getTranslations("common");

  const mapUrl = `/peta?kod=${encodeURIComponent(school.kodSekolah)}`;
  const ratio =
    typeof school.guru === "number" && school.guru > 0 && typeof school.enrolmen === "number"
      ? (school.enrolmen / school.guru).toFixed(1)
      : null;

  const enrolment = typeof school.enrolmen === "number" ? school.enrolmen : 0;
  const teachers = typeof school.guru === "number" ? school.guru : 0;
  const estimatedClassSize = teachers > 0 && enrolment >= 0 ? enrolment / teachers : null;
  const minClassesFor30 = enrolment > 0 ? Math.ceil(enrolment / IDEAL_CLASS_SIZE) : null;
  const minTeachersFor30 = enrolment > 0 ? Math.ceil(enrolment / IDEAL_CLASS_SIZE) : null;
  const teacherShortfall =
    minTeachersFor30 != null && teachers >= 0 ? Math.max(0, minTeachersFor30 - teachers) : null;

  const allSchools = getAllSchools();
  const comparison = getSchoolComparisonStats(allSchools, school);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <SchoolHeader school={school} t={t} tCommon={tCommon} />
      <SchoolAtAGlance school={school} ratio={ratio} t={t} />
      <SchoolMeaningfulStats
        comparison={comparison}
        enrolment={enrolment}
        teachers={teachers}
        estimatedClassSize={estimatedClassSize}
        minClassesFor30={minClassesFor30}
        minTeachersFor30={minTeachersFor30}
        teacherShortfall={teacherShortfall}
        t={t}
      />
      <SchoolAddressCard school={school} mapUrl={mapUrl} t={t} />
      <SchoolContactCard school={school} t={t} />
      <SchoolAuthorityCard school={school} t={t} />
      <SchoolQuickFacts school={school} t={t} />
    </div>
  );
}
