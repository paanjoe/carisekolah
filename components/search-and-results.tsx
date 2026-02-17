"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { School } from "@/types/school";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { MapPin, FileText, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

function normalizeSearchQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

function schoolMatchesQuery(s: School, q: string): boolean {
  if (!q) return true;
  const norm = normalizeSearchQuery(q);
  const name = (s.namaSekolah || "").toLowerCase();
  const code = (s.kodSekolah || "").toLowerCase();
  const alamat = (s.alamat || "").toLowerCase();
  const bandar = (s.bandar || "").toLowerCase();
  const negeri = (s.negeri || "").toLowerCase();
  const ppd = (s.ppd || "").toLowerCase();
  return (
    name.includes(norm) ||
    code.includes(norm) ||
    alamat.includes(norm) ||
    bandar.includes(norm) ||
    negeri.includes(norm) ||
    ppd.includes(norm)
  );
}

/** Tailwind classes for school type badge (bg + text). */
function schoolTypeBadgeClass(jenis: string | undefined): string {
  const j = (jenis || "").trim();
  const map: Record<string, string> = {
    SK: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    "SK KHAS": "bg-amber-200/80 text-amber-900 dark:bg-amber-800/40 dark:text-amber-100",
    SJKC: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
    SJKT: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
    SMK: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    "SM SABK": "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    "SR SABK": "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    SBP: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    KV: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
    SMT: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  };
  return map[j] ?? "bg-muted text-muted-foreground";
}

/** Relevance score for sorting: name match > code match > address/other. Higher = better. */
function searchRelevanceScore(s: School, q: string): number {
  const norm = normalizeSearchQuery(q);
  if (!norm) return 0;
  const name = (s.namaSekolah || "").toLowerCase();
  const code = (s.kodSekolah || "").toLowerCase();
  const alamat = (s.alamat || "").toLowerCase();
  const bandar = (s.bandar || "").toLowerCase();
  const negeri = (s.negeri || "").toLowerCase();
  const ppd = (s.ppd || "").toLowerCase();
  let score = 0;
  if (name.includes(norm)) {
    score += 100;
    if (name.startsWith(norm) || name.includes(" " + norm) || name.includes(norm + " "))
      score += 50;
  }
  if (code.includes(norm)) score += 80;
  if (bandar.includes(norm)) score += 20;
  if (alamat.includes(norm)) score += 15;
  if (negeri.includes(norm)) score += 10;
  if (ppd.includes(norm)) score += 10;
  return score;
}

type Props = {
  schools: School[];
  negeriOptions: string[];
  ppdOptions: string[];
  jenisOptions: string[];
  lokasiOptions: string[];
  initialQuery?: string;
};

export function SearchAndResults({
  schools,
  negeriOptions,
  ppdOptions,
  jenisOptions,
  lokasiOptions,
  initialQuery = "",
}: Props) {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState(initialQuery);
  const ALL = "__all__";
  const [negeri, setNegeri] = useState<string>(ALL);
  const [ppd, setPpd] = useState<string>(ALL);
  const [jenis, setJenis] = useState<string>(ALL);
  const [lokasi, setLokasi] = useState<string>(ALL);
  const PAGE_SIZES = [10, 50, 100] as const;
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let result = schools;
    const q = normalizeSearchQuery(query);
    if (q) {
      result = result.filter((s) => schoolMatchesQuery(s, query));
      result = [...result].sort((a, b) => searchRelevanceScore(b, query) - searchRelevanceScore(a, query));
    }
    if (negeri && negeri !== ALL) result = result.filter((s) => (s.negeri || "").trim() === negeri);
    if (ppd && ppd !== ALL) result = result.filter((s) => (s.ppd || "").trim() === ppd);
    if (jenis && jenis !== ALL) result = result.filter((s) => (s.jenis || "").trim() === jenis);
    if (lokasi && lokasi !== ALL) result = result.filter((s) => (s.lokasi || "").trim() === lokasi);
    return result;
  }, [schools, query, negeri, ppd, jenis, lokasi]);

  const suggestions = useMemo(() => {
    if (normalizeSearchQuery(query).length < 2) return [];
    return filtered
      .slice(0, 10)
      .map((s) => ({ name: s.namaSekolah || s.kodSekolah, code: s.kodSekolah }));
  }, [filtered, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, negeri, ppd, jenis, lokasi]);

  const setPageSizeWithReset = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setNegeri(ALL);
    setPpd(ALL);
    setJenis(ALL);
    setLokasi(ALL);
    setCurrentPage(1);
  };

  return (
    <div id="search-section" className="flex flex-col lg:flex-row gap-6 scroll-mt-4">
      {/* Left sidebar: filter by state */}
      <aside className="lg:w-56 shrink-0">
        <nav className="sticky top-20 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">{t("filterByState")}</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto py-1 px-2 text-xs"
              onClick={resetFilters}
            >
              {tCommon("reset")}
            </Button>
          </div>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => setNegeri(ALL)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  negeri === ALL
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {t("allStates")}
              </button>
            </li>
            {negeriOptions.map((n) => (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => setNegeri(n)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    negeri === n
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main: filter bar + results */}
      <div className="min-w-0 flex-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("filter")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div ref={searchContainerRef} className="relative">
              <label className="text-sm font-medium mb-1 block">{t("searchPlaceholder")}</label>
              <Input
                type="text"
                autoComplete="off"
                placeholder={t("searchPlaceholderExample")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card py-1 shadow-lg max-h-60 overflow-auto"
                  role="listbox"
                >
                  {suggestions.map(({ name, code }) => (
                    <li
                      key={code}
                      role="option"
                      className="cursor-pointer px-3 py-2 text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(name || code);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground ml-2">{code}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("state")}</label>
                <Select value={negeri} onValueChange={setNegeri}>
                  <SelectTrigger>
                    <SelectValue placeholder={tCommon("all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{tCommon("all")}</SelectItem>
                    {negeriOptions.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("ppd")}</label>
                <Select value={ppd} onValueChange={setPpd}>
                  <SelectTrigger>
                    <SelectValue placeholder={tCommon("all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{tCommon("all")}</SelectItem>
                    {ppdOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("type")}</label>
                <Select value={jenis} onValueChange={setJenis}>
                  <SelectTrigger>
                    <SelectValue placeholder={tCommon("all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{tCommon("all")}</SelectItem>
                    {jenisOptions.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("location")}</label>
                <Select value={lokasi} onValueChange={setLokasi}>
                  <SelectTrigger>
                    <SelectValue placeholder={tCommon("all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{tCommon("all")}</SelectItem>
                    {lokasiOptions.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" onClick={resetFilters}>
              {tCommon("reset")}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-muted-foreground">
            {filtered.length === 0
              ? t("noSchoolsMatch")
              : t("showingRangeOf", {
                  from: (currentPage - 1) * pageSize + 1,
                  to: Math.min(currentPage * pageSize, filtered.length),
                  count: filtered.length,
                })}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t("showPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSizeWithReset(Number(v))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t("perPage")}</span>
          </div>
        </div>

        <div className="grid gap-3">
          {paginated.map((s) => (
            <Card key={s.kodSekolah} className="overflow-hidden">
              <CardHeader className="py-4 flex flex-row gap-4">
                <div
                  className="h-14 w-14 shrink-0 rounded-lg bg-muted flex items-center justify-center border border-border"
                  aria-hidden
                >
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">
                    {s.namaSekolah || s.kodSekolah}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                      {s.negeri}
                    </span>
                    {s.jenis && (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${schoolTypeBadgeClass(s.jenis)}`}
                      >
                        {s.jenis}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-0 pb-4 text-sm text-muted-foreground space-y-1">
                <p>{tCommon("code")}: {s.kodSekolah}</p>
                <p>{s.negeri} · {s.ppd}</p>
                {s.bandar && <p>{s.bandar} {s.poskod && `· ${s.poskod}`}</p>}
                {s.enrolmen != null && <p>{t("enrolment")}: {s.enrolmen}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/peta?kod=${encodeURIComponent(s.kodSekolah)}`} className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {tCommon("viewOnMap")}
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/sekolah/${encodeURIComponent(s.kodSekolah)}`} className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {tCommon("viewSchoolDetails")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t("pageOf", { current: currentPage, total: totalPages })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label={t("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label={t("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
