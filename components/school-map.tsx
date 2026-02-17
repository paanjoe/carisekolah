"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { School } from "@/types/school";

type Props = {
  schools: School[];
  highlightKod?: string | null;
  locale: string;
};

export function SchoolMap({ schools, highlightKod, locale }: Props) {
  const t = useTranslations("map");
  const containerRef = useRef<HTMLDivElement>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    schools: School[];
    highlightKod?: string | null;
    locale: string;
  }> | null>(null);

  useEffect(() => {
    import("./school-map-inner").then((m) => setMapComponent(() => m.SchoolMapInner));
  }, []);

  if (!MapComponent) {
    return (
      <div ref={containerRef} className="w-full h-[500px] rounded-lg border bg-muted flex items-center justify-center">
        {t("loading")}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] overflow-hidden">
      <MapComponent schools={schools} highlightKod={highlightKod} locale={locale} />
    </div>
  );
}
