import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import type { School } from "@/types/school";

type Props = {
  school: School;
  t: (key: string) => string;
};

export function SchoolAuthorityCard({ school, t }: Props) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {t("authority")}
      </h2>
      <Card>
        <CardContent className="pt-4">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
            {school.negeri} · {school.ppd}
          </p>
          {school.parlimen && <p className="mt-1 text-sm">{t("parliament")}: {school.parlimen}</p>}
          {school.dun && <p className="text-sm">{t("dun")}: {school.dun}</p>}
        </CardContent>
      </Card>
    </section>
  );
}
