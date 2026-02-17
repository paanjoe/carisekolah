import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchoolByKod, getAllSchools, getSchoolComparisonStats, PACKED_PTR_THRESHOLD } from "@/lib/schools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { MapPin, Phone, Mail, Building2, Users, GraduationCap, BarChart3, TrendingUp } from "lucide-react";

type Props = { params: Promise<{ locale: string; schoolCode: string }> };

export async function generateStaticParams() {
  const schools = getAllSchools();
  const params: { locale: string; schoolCode: string }[] = [];
  for (const locale of routing.locales) {
    for (const s of schools) {
      params.push({ locale, schoolCode: s.kodSekolah });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, schoolCode } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const school = getSchoolByKod(decodeURIComponent(schoolCode));
  const t = await getTranslations({ locale, namespace: "schoolDetail" });
  if (!school) return { title: t("notFound") };
  return {
    title: `${school.namaSekolah || school.kodSekolah} | carisekolah.my`,
    description: `${school.negeri} · ${school.ppd}. ${school.bandar || ""} ${school.poskod || ""}. ${school.jenis}.`,
  };
}

function schoolTypeBadgeClass(jenis: string | undefined): string {
  const j = (jenis || "").trim();
  const map: Record<string, string> = {
    SK: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    "SK KHAS": "bg-amber-200/80 text-amber-900",
    SJKC: "bg-red-100 text-red-800",
    SJKT: "bg-orange-100 text-orange-800",
    SMK: "bg-blue-100 text-blue-800",
    SBP: "bg-emerald-100 text-emerald-800",
    KV: "bg-teal-100 text-teal-800",
  };
  return map[j] ?? "bg-muted text-muted-foreground";
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
  const hasPreschool = (school.prasekolah || "").toUpperCase() === "ADA";

  const IDEAL_CLASS_SIZE = 30;
  const enrolment = typeof school.enrolmen === "number" ? school.enrolmen : 0;
  const teachers = typeof school.guru === "number" ? school.guru : 0;
  const estimatedClassSize = teachers > 0 && enrolment >= 0 ? enrolment / teachers : null;
  const minClassesFor30 = enrolment > 0 ? Math.ceil(enrolment / IDEAL_CLASS_SIZE) : null;
  const minTeachersFor30 = enrolment > 0 ? Math.ceil(enrolment / IDEAL_CLASS_SIZE) : null;
  const teacherShortfall = minTeachersFor30 != null && teachers >= 0 ? Math.max(0, minTeachersFor30 - teachers) : null;

  const allSchools = getAllSchools();
  const comparison = getSchoolComparisonStats(allSchools, school);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToSearch")}
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/directory" className="text-sm text-muted-foreground hover:text-foreground">
          {tCommon("directory")}
        </Link>
      </div>

      {/* Hero: name, code, type, state */}
      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {school.namaSekolah || school.kodSekolah}
        </h1>
        <p className="text-muted-foreground">{t("code")}: {school.kodSekolah}</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2.5 py-1 text-sm font-medium">
            {school.negeri}
          </span>
          {school.jenis && (
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${schoolTypeBadgeClass(school.jenis)}`}>
              {school.jenis}
            </span>
          )}
          {school.lokasi && (
            <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
              {school.lokasi}
            </span>
          )}
        </div>
      </header>

      {/* At a glance – key numbers for parents */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("atAGlance")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {school.enrolmen != null && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{t("enrolment")}</span>
                </div>
                <p className="text-xl font-bold mt-1">{school.enrolmen.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
          {school.guru != null && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-xs">{t("teachers")}</span>
                </div>
                <p className="text-xl font-bold mt-1">{school.guru.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
          {ratio != null && (
            <Card>
              <CardContent className="pt-4">
                <span className="text-xs text-muted-foreground">{t("studentTeacherRatio")}</span>
                <p className="text-xl font-bold mt-1">{ratio}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-4">
              <span className="text-xs text-muted-foreground">{t("session")}</span>
              <p className="text-lg font-semibold mt-1">{school.sesi || "–"}</p>
            </CardContent>
          </Card>
        </div>
        {hasPreschool && (
          <p className="text-sm text-muted-foreground mt-2">
            ✓ {t("preSchoolEnrolment")}: {school.enrolmenPrasekolah ?? "Yes"}
          </p>
        )}
      </section>

      {/* Meaningful statistics & comparison – visual */}
      <section className="rounded-2xl border border-border overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
        <div className="p-5 pb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <BarChart3 className="h-5 w-5" />
            </span>
            {t("meaningfulStats")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("meaningfulStatsIntro")}</p>
        </div>
        <div className="px-5 pb-5 space-y-6">
          {/* PTR comparison – bar chart style */}
          {(comparison.schoolPtr != null || comparison.statePtr != null || comparison.nationalPtr != null) && (() => {
            const PTR_SCALE_MAX = 30;
            const barPct = (v: number) => Math.min(100, (v / PTR_SCALE_MAX) * 100);
            return (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("ptrComparison")}
                </p>
                <div className="space-y-3">
                  {comparison.schoolPtr != null && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-foreground">{t("thisSchool")}</span>
                        <span className="font-bold text-primary tabular-nums">{comparison.schoolPtr.toFixed(1)}</span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="stat-bar-wrap absolute inset-y-0 left-0 inline-block h-full min-w-0 max-w-full"
                          style={{ width: `${barPct(comparison.schoolPtr)}%` }}
                        >
                          <div className="h-full w-full rounded-full bg-primary min-h-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  {comparison.statePtr != null && comparison.stateName && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-foreground">{t("stateAverage")}</span>
                        <span className="font-bold text-primary tabular-nums">{comparison.statePtr.toFixed(1)}</span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="stat-bar-wrap stat-bar-wrap-delay-1 absolute inset-y-0 left-0 inline-block h-full min-w-0 max-w-full"
                          style={{ width: `${barPct(comparison.statePtr)}%` }}
                        >
                          <div className="h-full w-full rounded-full bg-primary min-h-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  {comparison.typePtr != null && comparison.typeName && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-foreground">{t("sameTypeAverage", { type: comparison.typeName })}</span>
                        <span className="font-bold text-primary tabular-nums">{comparison.typePtr.toFixed(1)}</span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="stat-bar-wrap stat-bar-wrap-delay-2 absolute inset-y-0 left-0 inline-block h-full min-w-0 max-w-full"
                          style={{ width: `${barPct(comparison.typePtr)}%` }}
                        >
                          <div className="h-full w-full rounded-full bg-primary min-h-full" />
                        </div>
                      </div>
                    </div>
                  )}
                  {comparison.nationalPtr != null && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-foreground">{t("nationalAverage")}</span>
                        <span className="font-bold text-primary tabular-nums">{comparison.nationalPtr.toFixed(1)}</span>
                      </div>
                      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="stat-bar-wrap stat-bar-wrap-delay-3 absolute inset-y-0 left-0 inline-block h-full min-w-0 max-w-full"
                          style={{ width: `${barPct(comparison.nationalPtr)}%` }}
                        >
                          <div className="h-full w-full rounded-full bg-primary min-h-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                  <span>0</span>
                  <span>{PTR_SCALE_MAX}</span>
                </div>
                {comparison.isPacked ? (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2.5">
                    <span className="text-amber-600 dark:text-amber-400 text-lg">⚠</span>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {t("packedLabel", { threshold: PACKED_PTR_THRESHOLD })}
                    </p>
                  </div>
                ) : comparison.schoolPtr != null && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                    <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t("withinRatio")}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-muted pl-3">
                  {t("ptrInterpretation")}
                </p>
              </div>
            );
          })()}

          {/* 30-pupil ideal: estimated class size vs guideline */}
          {estimatedClassSize != null && (
            <div className="rounded-xl border border-border bg-card/50 p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                  {t("idealClassSize")}
                </p>
                <p className="text-xs text-muted-foreground mb-3">{t("idealClassSizeIntro")}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{t("estimatedClassSize")}</span>
                    <span className="font-bold tabular-nums">{estimatedClassSize.toFixed(1)}</span>
                  </div>
                  <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                    <div
                      className="stat-bar-wrap stat-bar-wrap-delay-2 absolute inset-y-0 left-0 inline-block h-full min-w-0 max-w-full"
                      style={{ width: `${Math.min(100, (estimatedClassSize / 50) * 100)}%` }}
                    >
                      <div className="h-full w-full rounded-full bg-primary min-h-full" />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-10"
                      style={{ left: `${Math.min(100, (IDEAL_CLASS_SIZE / 50) * 100)}%` }}
                      title={t("idealMax")}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span className="font-medium text-foreground">{t("idealMax")} ←</span>
                    <span>50</span>
                  </div>
                </div>
                {estimatedClassSize > IDEAL_CLASS_SIZE ? (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2.5">
                    <span className="text-amber-600 dark:text-amber-400">⚠</span>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t("aboveIdeal")}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                    <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t("withinIdeal")}</p>
                  </div>
                )}
              </div>
              {minClassesFor30 != null && minTeachersFor30 != null && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t("minClassesFor30")}</p>
                    <p className="font-semibold tabular-nums">{minClassesFor30}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t("minTeachersFor30")}</p>
                    <p className="font-semibold tabular-nums">{minTeachersFor30}</p>
                  </div>
                </div>
              )}
              {teacherShortfall != null && teacherShortfall > 0 ? (
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  {t("teacherShortfall", { count: teacherShortfall })}
                </p>
              ) : teachers > 0 && minTeachersFor30 != null && teachers >= minTeachersFor30 ? (
                <p className="text-sm text-muted-foreground">{t("meetsGuideline")}</p>
              ) : null}
            </div>
          )}

          {/* Class size / density – placeholder + data needed */}
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {t("classSizeDensity")}
            </p>
            <p className="text-sm text-muted-foreground">{t("classSizePlaceholder")}</p>
            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">{t("dataNeededForClassSize")}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("dataNeededEnrolmentByLevel")}</li>
                <li>{t("dataNeededClassCount")}</li>
                <li>{t("dataNeededOrDirect")}</li>
              </ul>
              <p className="text-primary font-medium pt-1">{t("comingWithData")}</p>
            </div>
          </div>

          {/* Enrolment – percentile gauge */}
          {comparison.enrolmentPercentileInState != null && comparison.stateName && comparison.stateEnrolmentCount > 1 && (
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("enrolmentComparison")}
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="relative h-16 w-16 shrink-0"
                  style={{ ['--gauge-dash' as string]: `${comparison.enrolmentPercentileInState}` }}
                >
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted stroke-[3]"
                      stroke="currentColor"
                      fill="none"
                      strokeDasharray="100"
                      strokeLinecap="round"
                      d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    />
                    <path
                      className="text-primary stroke-[3] stat-gauge-animate"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground tabular-nums">
                    {comparison.enrolmentPercentileInState}%
                  </span>
                </div>
                <p className="text-sm text-foreground leading-snug">
                  {comparison.enrolmentPercentileInState >= 50
                    ? t("largerThanPercent", {
                        percent: comparison.enrolmentPercentileInState,
                        state: comparison.stateName,
                      })
                    : t("smallerThanPercent", {
                        percent: 100 - comparison.enrolmentPercentileInState,
                        state: comparison.stateName,
                      })}
                </p>
              </div>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/statistik"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/10 py-3 px-4 text-sm font-semibold text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors"
          >
            <TrendingUp className="h-5 w-5" />
            {t("viewFullStats")}
          </Link>
        </div>
      </section>

      {/* Address & map */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("address")}
        </h2>
        <Card>
          <CardContent className="pt-4">
            <p className="text-foreground">
              {school.alamat}
              {school.bandar && `, ${school.bandar}`}
              {school.poskod && ` ${school.poskod}`}
            </p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href={mapUrl} className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t("viewOnMap")} / {t("getDirections")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("contactSchool")}
        </h2>
        <Card>
          <CardContent className="pt-4 space-y-2">
            {school.telefon && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${school.telefon}`} className="text-primary hover:underline">
                  {school.telefon}
                </a>
              </p>
            )}
            {school.fax && school.fax !== "TIADA" && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">{t("fax")}:</span> {school.fax}
              </p>
            )}
            {school.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${school.email}`} className="text-primary hover:underline">
                  {school.email}
                </a>
              </p>
            )}
            {!school.telefon && !school.email && (school.fax === "TIADA" || !school.fax) && (
              <p className="text-muted-foreground text-sm">–</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Authority / governance */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("authority")}
        </h2>
        <Card>
          <CardContent className="pt-4">
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              {school.negeri} · {school.ppd}
            </p>
            {school.parlimen && <p className="mt-1 text-sm">{t("parliament")}: {school.parlimen}</p>}
            {school.dun && <p className="text-sm">{t("dun")}: {school.dun}</p>}
          </CardContent>
        </Card>
      </section>

      {/* Quick facts */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("quickFacts")}
        </h2>
        <Card>
          <CardContent className="pt-4">
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              <li><span className="text-muted-foreground">{t("type")}:</span> {school.jenis ?? "–"}</li>
              <li><span className="text-muted-foreground">{t("level")}:</span> {school.peringkat ?? "–"}</li>
              <li><span className="text-muted-foreground">{t("location")}:</span> {school.lokasi ?? "–"}</li>
              <li><span className="text-muted-foreground">{t("grade")}:</span> {school.gred ?? "–"}</li>
              {school.enrolmenPrasekolah != null && (
                <li><span className="text-muted-foreground">{t("preSchoolEnrolment")}:</span> {school.enrolmenPrasekolah}</li>
              )}
              {school.enrolmenKhas != null && school.enrolmenKhas > 0 && (
                <li><span className="text-muted-foreground">{t("specialEnrolment")}:</span> {school.enrolmenKhas}</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
