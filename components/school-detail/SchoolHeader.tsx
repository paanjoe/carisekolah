import { Link } from "@/i18n/navigation";
import { schoolTypeBadgeClass } from "@/lib/school-detail-utils";
import type { School } from "@/types/school";

type Props = {
  school: School;
  t: (key: string) => string;
  tCommon: (key: string) => string;
};

export function SchoolHeader({ school, t, tCommon }: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          {t("backToSearch")}
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/directory" className="text-sm text-muted-foreground hover:text-foreground">
          {tCommon("directory")}
        </Link>
      </div>
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
    </>
  );
}
