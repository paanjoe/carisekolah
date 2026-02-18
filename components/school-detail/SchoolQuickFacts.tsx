import { Card, CardContent } from "@/components/ui/card";
import type { School } from "@/types/school";

type Props = {
  school: School;
  t: (key: string) => string;
};

export function SchoolQuickFacts({ school, t }: Props) {
  return (
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
  );
}
