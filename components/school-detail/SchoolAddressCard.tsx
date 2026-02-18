import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { MapPin } from "lucide-react";
import type { School } from "@/types/school";

type Props = {
  school: School;
  mapUrl: string;
  t: (key: string) => string;
};

export function SchoolAddressCard({ school, mapUrl, t }: Props) {
  return (
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
              <MapPin className="h-4 w-4" aria-hidden />
              {t("viewOnMap")} / {t("getDirections")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
