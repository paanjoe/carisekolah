"use client";

import { useState } from "react";
import { usePathname, Link } from "@/i18n/navigation";
import {
  LayoutDashboard, BookOpen, Map, BarChart2,
  Scale, Wrench, TrendingUp, Database,
  Menu, X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleDropdown } from "@/components/locale-dropdown";

// ─── Icon map keyed by href ────────────────────────────────────────────────────

const NAV_ICONS: Record<string, React.ElementType> = {
  "/":                LayoutDashboard,
  "/directory":       BookOpen,
  "/peta":            Map,
  "/statistik":       BarChart2,
  "/compare":         Scale,
  "/facility":        Wrench,
  "/page-statistics": TrendingUp,
  "/data-catalogue":  Database,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
}

interface SidebarLayoutProps {
  appName: string;
  navItems: NavItem[];
  children: React.ReactNode;
  footer: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SidebarLayout({ appName, navItems, children, footer }: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto",
          "w-56 flex flex-col overflow-y-auto",
          "bg-sidebar border-r border-border",
          "transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + status */}
        <div className="px-4 pt-5 pb-4 border-b border-border shrink-0">
          <Link href="/" onClick={() => setMobileOpen(false)} className="group block">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-[1.15rem] text-primary tracking-tight group-hover:opacity-80 transition-opacity">
                {appName}
              </span>
              <span aria-hidden className="text-sm">🇲🇾</span>
            </div>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground font-sans">
              SCHOOL INTELLIGENCE
            </p>
          </Link>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden />
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.12em]">
              LIVE · KPM DATA 2024
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Sidebar navigation">
          <p className="px-2 pb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground/50 font-sans">
            NAVIGASI
          </p>
          {navItems.map(({ href, label }) => {
            const Icon = NAV_ICONS[href] ?? BookOpen;
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-2.5 px-2.5 py-[7px] rounded transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="text-[12px] font-sans font-medium leading-none">{label}</span>
                {active && (
                  <ChevronRight className="h-3 w-3 ml-auto opacity-60" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme + locale controls */}
        <div className="shrink-0 px-3 py-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60">
              TEMA
            </span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60">
              BAHASA
            </span>
            <LocaleDropdown />
          </div>
        </div>

        {/* Attribution */}
        <div className="shrink-0 px-4 py-3 border-t border-border">
          <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.08em]">
            v1.0 · Data: KPM EMIS 2024
          </p>
          <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">
            © CivicTechMY
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-12 px-4 border-b border-border bg-sidebar shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/" className="font-display font-bold text-primary text-base">
            {appName} 🇲🇾
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LocaleDropdown />
          </div>
        </div>

        {/* Page content + footer */}
        {children}
        {footer}

      </div>
    </div>
  );
}
