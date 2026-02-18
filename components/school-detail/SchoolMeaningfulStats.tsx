import { Link } from "@/i18n/navigation";
import { PACKED_PTR_THRESHOLD, type SchoolComparisonStats } from "@/lib/schools";
import { BarChart3, TrendingUp } from "lucide-react";

const IDEAL_CLASS_SIZE = 30;
const PTR_SCALE_MAX = 30;

type Props = {
  comparison: SchoolComparisonStats;
  enrolment: number;
  teachers: number;
  estimatedClassSize: number | null;
  minClassesFor30: number | null;
  minTeachersFor30: number | null;
  teacherShortfall: number | null;
  t: (key: string, values?: Record<string, string | number>) => string;
};

function barPct(v: number) {
  return Math.min(100, (v / PTR_SCALE_MAX) * 100);
}

export function SchoolMeaningfulStats({
  comparison,
  enrolment,
  teachers,
  estimatedClassSize,
  minClassesFor30,
  minTeachersFor30,
  teacherShortfall,
  t,
}: Props) {
  const hasPtr =
    comparison.schoolPtr != null ||
    comparison.statePtr != null ||
    comparison.nationalPtr != null;

  return (
    <section className="rounded-2xl border border-border overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
      <div className="p-5 pb-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </span>
          {t("meaningfulStats")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("meaningfulStatsIntro")}</p>
      </div>
      <div className="px-5 pb-5 space-y-6">
        {hasPtr && (
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
                <span className="text-amber-600 dark:text-amber-400 text-lg" aria-hidden>⚠</span>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t("packedLabel", { threshold: PACKED_PTR_THRESHOLD })}
                </p>
              </div>
            ) : comparison.schoolPtr != null ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 text-lg" aria-hidden>✓</span>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t("withinRatio")}</p>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-muted pl-3">
              {t("ptrInterpretation")}
            </p>
          </div>
        )}

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
                  <span className="text-amber-600 dark:text-amber-400" aria-hidden>⚠</span>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t("aboveIdeal")}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>✓</span>
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

        {comparison.enrolmentPercentileInState != null &&
          comparison.stateName &&
          comparison.stateEnrolmentCount > 1 && (
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t("enrolmentComparison")}
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="relative h-16 w-16 shrink-0"
                  style={{ ["--gauge-dash" as string]: `${comparison.enrolmentPercentileInState}` }}
                >
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36" aria-hidden>
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

        <Link
          href="/statistik"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/10 py-3 px-4 text-sm font-semibold text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors"
        >
          <TrendingUp className="h-5 w-5" aria-hidden />
          {t("viewFullStats")}
        </Link>
      </div>
    </section>
  );
}
