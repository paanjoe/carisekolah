"use client";

import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Search, MapPin, BarChart3, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SchoolSuggestion = { kodSekolah: string; namaSekolah?: string; negeri?: string };

export function HomeHero() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/suggest?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setHighlightedIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) fetchSuggestions(query);
      else setSuggestions([]);
    }, 280);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/") {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape") {
        setOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goToDirectory = () => {
    const q = query.trim();
    setOpen(false);
    setSuggestions([]);
    if (q) router.push(`/directory?q=${encodeURIComponent(q)}`);
    else router.push("/directory");
  };

  const goToSchool = (kod: string) => {
    setOpen(false);
    setSuggestions([]);
    router.push(`/${encodeURIComponent(kod)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      goToSchool(suggestions[highlightedIndex].kodSekolah);
      return;
    }
    goToDirectory();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") goToDirectory();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault();
      goToSchool(suggestions[highlightedIndex].kodSekolah);
    }
  };

  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !measureRef.current) return;
    const el = measureRef.current;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setDropdownRect({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const showDropdown = open && (suggestions.length > 0 || loading);
  const dropdownContent =
    typeof document !== "undefined" &&
    showDropdown &&
    dropdownRect &&
    createPortal(
      <ul
        id="hero-suggestions"
        role="listbox"
        className={cn(
          "fixed z-[100] rounded-xl border border-border bg-card py-1 shadow-xl",
          "max-h-[280px] overflow-auto"
        )}
        style={{
          top: `${dropdownRect.top}px`,
          left: `${dropdownRect.left}px`,
          width: `${dropdownRect.width}px`,
        }}
      >
        {loading && (
          <li className="px-4 py-3 text-sm text-muted-foreground">...</li>
        )}
        {!loading &&
          suggestions.map((s, i) => (
            <li
              key={s.kodSekolah}
              role="option"
              aria-selected={i === highlightedIndex}
              className={cn(
                "cursor-pointer px-4 py-3 text-sm transition-colors",
                i === highlightedIndex ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-muted/60"
              )}
              onMouseEnter={() => setHighlightedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                goToSchool(s.kodSekolah);
              }}
            >
              <span className="font-medium">{s.namaSekolah || s.kodSekolah}</span>
              {s.kodSekolah && (
                <span className="text-muted-foreground ml-2">{s.kodSekolah}</span>
              )}
              {s.negeri && (
                <span className="text-muted-foreground ml-2">· {s.negeri}</span>
              )}
            </li>
          ))}
      </ul>,
      document.body
    );

  return (
    <section className="relative bg-[hsl(var(--hero-accent))] border-b border-border">
      <div className="container mx-auto px-4 pt-6 pb-12 md:pt-8 md:pb-16">
        <div className="grid md:grid-cols-[1fr,minmax(400px,680px)] gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl flex items-center gap-2 whitespace-nowrap flex-nowrap">
              {t("welcomeTitlePrefix")}
              <span className="text-primary">{tCommon("appName")}</span>
              <span aria-hidden>🇲🇾</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              {t("welcomeSubtitle")}
            </p>
            <div ref={containerRef} className="max-w-xl">
              <div ref={measureRef} className="relative">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Input
                      ref={inputRef}
                      type="text"
                      autoComplete="off"
                      placeholder={t("searchPlaceholder")}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                      }}
                      onFocus={() => query.length >= 2 && setOpen(true)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "h-12 rounded-xl border-border bg-background pl-4 text-base shadow-sm",
                        query ? "pr-12" : "pr-4"
                      )}
                      aria-label={t("searchPlaceholder")}
                      aria-expanded={open}
                      aria-controls="hero-suggestions"
                      aria-autocomplete="list"
                      role="combobox"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setOpen(false);
                          setSuggestions([]);
                          inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        aria-label={tCommon("reset")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button type="submit" size="lg" className="h-12 rounded-xl px-6 shrink-0">
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
              </div>
              {dropdownContent}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">{t("popularLinks")}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/directory"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/60 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  {tCommon("directory")}
                </Link>
                <Link
                  href="/peta"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/60 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {tCommon("map")}
                </Link>
                <Link
                  href="/statistik"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/60 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  {tCommon("statistics")}
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-center items-center" aria-hidden>
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div
      className="relative w-full max-w-[680px] aspect-square flex items-center justify-center"
      aria-hidden
    >
      <img
        src="/school-illustration.png"
        alt=""
        className="w-full h-full max-h-[680px] object-contain mix-blend-multiply dark:mix-blend-normal"
      />
    </div>
  );
}
