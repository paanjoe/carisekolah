"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { School } from "@/types/school";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Link } from "@/i18n/navigation";
import { HelpCircle } from "lucide-react";

/** Nisbah murid-guru di atas ini dianggap "sesak" */
const PACKED_RATIO_THRESHOLD = 20;

type Props = { schools: School[] };

export function StatsDashboard({ schools }: Props) {
  const t = useTranslations("statistics");

  const {
    byNegeri,
    byJenis,
    packedList,
    totalTeachers,
    totalEnrolment,
    nationalPtr,
    urbanCount,
    ruralCount,
    preschoolCount,
    teachersByState,
    enrolmentByState,
    avgPtrByState,
  } = useMemo(() => {
    const byNegeri: Record<string, number> = {};
    const byJenis: Record<string, number> = {};
    const withRatio: { school: School; ratio: number }[] = [];

    let totalTeachers = 0;
    let totalEnrolment = 0;
    let urbanCount = 0;
    let ruralCount = 0;
    let preschoolCount = 0;

    const stateTeachers: Record<string, number> = {};
    const stateEnrolment: Record<string, number> = {};
    const stateRatioSum: Record<string, number> = {};
    const stateRatioCount: Record<string, number> = {};

    for (const s of schools) {
      const negeri = (s.negeri || "").trim() || "Lain";
      byNegeri[negeri] = (byNegeri[negeri] || 0) + 1;
      const jenis = (s.jenis || "").trim() || "Lain";
      byJenis[jenis] = (byJenis[jenis] || 0) + 1;

      const enrolmen = typeof s.enrolmen === "number" ? s.enrolmen : 0;
      const guru = typeof s.guru === "number" ? s.guru : 0;
      totalTeachers += guru;
      totalEnrolment += enrolmen;

      if (guru > 0 && enrolmen >= 0) {
        const ratio = enrolmen / guru;
        withRatio.push({ school: s, ratio });
        stateRatioSum[negeri] = (stateRatioSum[negeri] || 0) + ratio;
        stateRatioCount[negeri] = (stateRatioCount[negeri] || 0) + 1;
      }
      stateTeachers[negeri] = (stateTeachers[negeri] || 0) + guru;
      stateEnrolment[negeri] = (stateEnrolment[negeri] || 0) + enrolmen;

      const lokasi = (s.lokasi || "").toLowerCase();
      if (lokasi.includes("bandar") && !lokasi.includes("luar")) urbanCount += 1;
      else if (lokasi.includes("luar")) ruralCount += 1;

      if ((s.prasekolah || "").toUpperCase() === "ADA") preschoolCount += 1;
    }

    const packedList = withRatio
      .filter((x) => x.ratio >= PACKED_RATIO_THRESHOLD)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 30);

    const negeriNames = Object.keys(byNegeri).sort((a, b) => byNegeri[b]! - byNegeri[a]!);
    const teachersByState = negeriNames.map((name) => ({ name, count: stateTeachers[name] || 0 }));
    const enrolmentByState = negeriNames.map((name) => ({ name, count: stateEnrolment[name] || 0 }));
    const avgPtrByState = negeriNames.map((name) => ({
      name,
      count: stateRatioCount[name] ? (stateRatioSum[name]! / stateRatioCount[name]!) : 0,
    }));

    return {
      byNegeri: Object.entries(byNegeri)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      byJenis: Object.entries(byJenis)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      packedList,
      totalTeachers,
      totalEnrolment,
      nationalPtr: totalTeachers > 0 ? totalEnrolment / totalTeachers : 0,
      urbanCount,
      ruralCount,
      preschoolCount,
      teachersByState,
      enrolmentByState,
      avgPtrByState,
    };
  }, [schools]);

  return (
    <div className="space-y-8 w-full">
      {/* Row 1: Core counts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalSchools")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{schools.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalTeachers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTeachers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalEnrolment")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEnrolment.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("nationalPtr")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{nationalPtr.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("nationalPtrDesc")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: States, urban/rural, preschool, packed */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("states")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byNegeri.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("urbanSchools")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{urbanCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("ruralSchools")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ruralCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("withPreschool")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{preschoolCount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Packed schools + definition */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("packedSchools", { threshold: PACKED_RATIO_THRESHOLD })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{packedList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("packedDefinition")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{t("packedDefinitionText", { threshold: PACKED_RATIO_THRESHOLD })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts: schools, teachers, enrolment, PTR by state */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("schoolsByState")}</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-[340px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={byNegeri.slice(0, 16)} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("schoolsByType")}</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-[340px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={byJenis} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
                  <YAxis width={40} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("teachersByState")}</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-[340px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={teachersByState.slice(0, 16)} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("enrolmentByState")}</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-[340px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={enrolmentByState.slice(0, 16)} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("avgPtrByState")}</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-[340px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={avgPtrByState.slice(0, 16)} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
                  <YAxis width={40} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => (typeof v === "number" ? v.toFixed(1) : v)} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg PTR" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facilities & access – placeholder for population-based metrics */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("facilitiesHealth")}
            <span className="text-xs font-normal text-muted-foreground">({t("placeholder")})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center">
            <p className="font-medium text-muted-foreground">{t("schoolsPer10k")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("schoolsPer10kDesc")}</p>
            <p className="text-sm text-primary mt-2">{t("comingSoon")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Data we need */}
      <Card className="bg-muted/30 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-5 w-5 text-primary" />
            {t("dataNeeded")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">{t("dataNeededPopulation")}</p>
          <p className="text-muted-foreground">{t("dataNeededFacilities")}</p>
        </CardContent>
      </Card>

      {/* Packed schools table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("schoolsByRatio")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("ratioCaption", { threshold: PACKED_RATIO_THRESHOLD })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">{t("tableSchool")}</th>
                  <th className="text-left py-2 pr-4">{t("tableCode")}</th>
                  <th className="text-left py-2 pr-4">{t("tableState")}</th>
                  <th className="text-right py-2 pr-4">{t("tableEnrolment")}</th>
                  <th className="text-right py-2 pr-4">{t("tableTeachers")}</th>
                  <th className="text-right py-2">{t("tableRatio")}</th>
                </tr>
              </thead>
              <tbody>
                {packedList.map(({ school, ratio }) => (
                  <tr key={school.kodSekolah} className="border-b border-border/50">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/sekolah/${encodeURIComponent(school.kodSekolah)}`}
                        className="text-primary hover:underline"
                      >
                        {school.namaSekolah || school.kodSekolah}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{school.kodSekolah}</td>
                    <td className="py-2 pr-4">{school.negeri}</td>
                    <td className="text-right py-2 pr-4">{school.enrolmen ?? "-"}</td>
                    <td className="text-right py-2 pr-4">{school.guru ?? "-"}</td>
                    <td className="text-right py-2 font-medium">{ratio.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {packedList.length === 0 && (
            <p className="text-muted-foreground py-4">{t("noPackedSchools")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
