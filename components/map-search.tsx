"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { School } from "@/types/school";
import { Search } from "lucide-react";

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

function schoolMatches(s: School, q: string): boolean {
  if (!q) return false;
  const norm = normalizeQuery(q);
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

function relevanceScore(s: School, q: string): number {
  const norm = normalizeQuery(q);
  if (!norm) return 0;
  const name = (s.namaSekolah || "").toLowerCase();
  const code = (s.kodSekolah || "").toLowerCase();
  const bandar = (s.bandar || "").toLowerCase();
  const alamat = (s.alamat || "").toLowerCase();
  const negeri = (s.negeri || "").toLowerCase();
  const ppd = (s.ppd || "").toLowerCase();
  let score = 0;
  if (name.includes(norm)) {
    score += 100;
    if (name.startsWith(norm) || name.includes(" " + norm) || name.includes(norm + " ")) score += 50;
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
};

const MAX_SUGGESTIONS = 12;

export function MapSearch({ schools }: Props) {
  const t = useTranslations("map");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const suggestions = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q || q.length < 2) return [];
    return schools
      .filter((s) => schoolMatches(s, query))
      .sort((a, b) => relevanceScore(b, query) - relevanceScore(a, query))
      .slice(0, MAX_SUGGESTIONS);
  }, [schools, query]);

  useEffect(() => {
    setOpen(query.length >= 2 && suggestions.length > 0);
    setFocusedIndex(-1);
  }, [query, suggestions.length]);

  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[focusedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  function handleSelect(kod: string) {
    setQuery("");
    setOpen(false);
    setFocusedIndex(-1);
    router.push(`/peta?kod=${encodeURIComponent(kod)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        handleSelect(suggestions[focusedIndex].kodSekolah);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocusedIndex(-1);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:border-primary"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="map-search-list"
          id="map-search-input"
        />
      </div>
      {open && (
        <ul
          id="map-search-list"
          ref={listRef}
          role="listbox"
          className="absolute z-[1000] mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-background shadow-lg py-1"
        >
          {suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground" role="option">
              {t("noResults")}
            </li>
          ) : (
            suggestions.map((s, i) => (
              <li
                key={s.kodSekolah}
                role="option"
                aria-selected={i === focusedIndex}
                className={`cursor-pointer px-3 py-2 text-sm ${i === focusedIndex ? "bg-muted" : ""} hover:bg-muted`}
                onMouseEnter={() => setFocusedIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s.kodSekolah)}
              >
                <span className="font-medium block truncate">{s.namaSekolah || s.kodSekolah}</span>
                <span className="text-muted-foreground text-xs">
                  {s.kodSekolah}
                  {s.negeri ? ` · ${s.negeri}` : ""}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
