/**
 * Tailwind class for school type badge (jenis) for WCAG-friendly contrast.
 */
export function schoolTypeBadgeClass(jenis: string | undefined): string {
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
