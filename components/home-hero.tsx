"use client";

import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Search, X, BookOpen, Map, BarChart2, Scale } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SchoolSuggestion = { kodSekolah: string; namaSekolah?: string; negeri?: string };

// ─── Metric cards data ────────────────────────────────────────────────────────

const METRICS = [
  {
    label:    "SEKOLAH AWAM",
    value:    "10,146",
    sublabel: "Government Schools",
    color:    "text-primary",
  },
  {
    label:    "JUMLAH ENROLMEN",
    value:    "3.1M",
    sublabel: "Total Enrolment",
    color:    "text-amber-600 dark:text-amber-400",
  },
  {
    label:    "NEGERI",
    value:    "16",
    sublabel: "States & Territories",
    color:    "text-blue-600 dark:text-blue-400",
  },
  {
    label:    "GURU BERDAFTAR",
    value:    "173K",
    sublabel: "Registered Teachers",
    color:    "text-teal-600 dark:text-teal-400",
  },
];

// ─── Panel header component ────────────────────────────────────────────────────

function PanelHeader({
  symbol = "●",
  title,
  badge,
}: {
  symbol?: string;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-primary text-[11px] leading-none" aria-hidden>{symbol}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground font-sans">
          {title}
        </span>
      </div>
      {badge}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

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

  // ── Autocomplete logic (preserved) ──────────────────────────────────────────

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
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
        if (!isInput) { e.preventDefault(); inputRef.current?.focus(); }
      }
      if (e.key === "Escape") { setOpen(false); setHighlightedIndex(-1); inputRef.current?.blur(); }
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
    setOpen(false); setSuggestions([]);
    router.push(q ? `/directory?q=${encodeURIComponent(q)}` : "/directory");
  };

  const goToSchool = (kod: string) => {
    setOpen(false); setSuggestions([]);
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
      setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
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
        aria-busy={loading}
        className="fixed z-[100] rounded border border-border bg-card py-1 shadow-2xl max-h-[280px] overflow-auto"
        style={{ top: `${dropdownRect.top}px`, left: `${dropdownRect.left}px`, width: `${dropdownRect.width}px` }}
      >
        {loading && (
          <li className="px-4 py-3 text-xs text-muted-foreground font-mono" aria-hidden>
            Mencari...
          </li>
        )}
        {!loading && suggestions.map((s, i) => (
          <li
            key={s.kodSekolah}
            id={`hero-suggestion-${i}`}
            role="option"
            aria-selected={i === highlightedIndex}
            className={cn(
              "cursor-pointer px-4 py-2.5 text-sm transition-colors font-sans",
              i === highlightedIndex
                ? "bg-primary/15 text-foreground"
                : "text-foreground hover:bg-muted/60"
            )}
            onMouseEnter={() => setHighlightedIndex(i)}
            onMouseDown={(e) => { e.preventDefault(); goToSchool(s.kodSekolah); }}
          >
            <span className="font-medium text-[13px]">{s.namaSekolah || s.kodSekolah}</span>
            <span className="text-muted-foreground font-mono text-[10px] ml-2">{s.kodSekolah}</span>
            {s.negeri && <span className="text-muted-foreground text-xs ml-2">· {s.negeri}</span>}
          </li>
        ))}
      </ul>,
      document.body
    );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-4">

      {/* Page header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground font-sans">
            DASHBOARD
          </h1>
          <p className="mt-0.5 font-display font-bold text-xl text-foreground">
            Direktori Sekolah Malaysia
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden />
          <span className="uppercase tracking-[0.1em]">10,146 sekolah diindeks</span>
        </div>
      </div>

      {/* ── Search panel ── */}
      <div className="border border-border rounded bg-card overflow-hidden">
        <PanelHeader symbol="●" title="CARI SEKOLAH" />
        <div className="p-4" ref={containerRef}>
          <div ref={measureRef}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden />
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  placeholder={t("searchPlaceholder")}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                  onFocus={() => query.length >= 2 && setOpen(true)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "w-full h-10 rounded border border-border bg-background pl-9 pr-9 text-sm font-sans",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  )}
                  aria-label={t("searchPlaceholder")}
                  aria-expanded={open}
                  aria-controls="hero-suggestions"
                  aria-activedescendant={
                    open && !loading && highlightedIndex >= 0 && suggestions[highlightedIndex]
                      ? `hero-suggestion-${highlightedIndex}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  role="combobox"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setOpen(false); setSuggestions([]); inputRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={tCommon("reset")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-10 px-5 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-[0.1em] font-sans transition-colors shrink-0"
                aria-label={tCommon("search")}
              >
                {tCommon("search")}
              </button>
            </form>
          </div>
          {dropdownContent}
          <p className="mt-2 text-[10px] text-muted-foreground font-sans">
            Carian pantas: taip nama sekolah, kod sekolah, bandar, atau negeri ·{" "}
            <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono text-[9px]">/</kbd>{" "}
            untuk fokus
          </p>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map((m) => (
          <div key={m.label} className="border border-border rounded bg-card p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground font-sans mb-2">
              {m.label}
            </p>
            <p className={cn("font-mono font-bold text-[1.75rem] leading-none", m.color)}>
              {m.value}
            </p>
            <p className="mt-1.5 text-[10px] text-muted-foreground font-sans">{m.sublabel}</p>
          </div>
        ))}
      </div>

      {/* ── Quick navigation pills ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: "/directory", icon: BookOpen, label: "Direktori" },
          { href: "/peta",      icon: Map,      label: "Peta" },
          { href: "/statistik", icon: BarChart2, label: "Statistik" },
          { href: "/compare",   icon: Scale,    label: "Bandingkan" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-[11px] font-sans font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon className="h-3 w-3" aria-hidden />
            {label}
          </Link>
        ))}
      </div>

    </div>
  );
}
