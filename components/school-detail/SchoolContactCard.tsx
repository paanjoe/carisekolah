import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";
import type { School } from "@/types/school";

type Props = {
  school: School;
  t: (key: string) => string;
};

export function SchoolContactCard({ school, t }: Props) {
  const hasContact = school.telefon || school.email || (school.fax && school.fax !== "TIADA");

  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {t("contactSchool")}
      </h2>
      <Card>
        <CardContent className="pt-4 space-y-2">
          {school.telefon && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
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
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
              <a href={`mailto:${school.email}`} className="text-primary hover:underline">
                {school.email}
              </a>
            </p>
          )}
          {!hasContact && (
            <p className="text-muted-foreground text-sm">–</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
