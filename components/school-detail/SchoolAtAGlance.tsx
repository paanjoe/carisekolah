import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap } from "lucide-react";
import type { School } from "@/types/school";

type Props = {
  school: School;
  ratio: string | null;
  t: (key: string) => string;
};

export function SchoolAtAGlance({ school, ratio, t }: Props) {
  const hasPreschool = (school.prasekolah || "").toUpperCase() === "ADA";

  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {t("atAGlance")}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {school.enrolmen != null && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden />
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
                <GraduationCap className="h-4 w-4" aria-hidden />
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
  );
}
