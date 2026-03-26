import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

// ─── Placeholder data ──────────────────────────────────────────────────────────

const STATES_DATA = [
  { rank: 1,  name: "Selangor",            count: 1847, pct: 100 },
  { rank: 2,  name: "Sabah",               count: 1356, pct: 73  },
  { rank: 3,  name: "Johor",               count: 1089, pct: 59  },
  { rank: 4,  name: "Perak",               count: 893,  pct: 48  },
  { rank: 5,  name: "Sarawak",             count: 881,  pct: 48  },
  { rank: 6,  name: "Kedah",               count: 743,  pct: 40  },
  { rank: 7,  name: "Pahang",              count: 681,  pct: 37  },
  { rank: 8,  name: "Kelantan",            count: 644,  pct: 35  },
  { rank: 9,  name: "Negeri Sembilan",     count: 521,  pct: 28  },
  { rank: 10, name: "Terengganu",          count: 507,  pct: 27  },
  { rank: 11, name: "Melaka",              count: 342,  pct: 19  },
  { rank: 12, name: "Pulau Pinang",        count: 321,  pct: 17  },
  { rank: 13, name: "W.P. Kuala Lumpur",   count: 264,  pct: 14  },
  { rank: 14, name: "Perlis",              count: 115,  pct: 6   },
  { rank: 15, name: "W.P. Putrajaya",      count: 28,   pct: 2   },
  { rank: 16, name: "W.P. Labuan",         count: 33,   pct: 2   },
];

const SCHOOL_TYPES = [
  { type: "SK",        label: "Sekolah Kebangsaan",            count: 7300, pct: 72, color: "bg-primary" },
  { type: "SJK(C)",    label: "Sekolah Jenis Keb. Cina",       count: 1294, pct: 13, color: "bg-blue-500 dark:bg-blue-400" },
  { type: "SJK(T)",    label: "Sekolah Jenis Keb. Tamil",      count: 523,  pct: 5,  color: "bg-amber-500 dark:bg-amber-400" },
  { type: "SMK",       label: "Sekolah Men. Kebangsaan",       count: 716,  pct: 7,  color: "bg-teal-500 dark:bg-teal-400" },
  { type: "Lain-lain", label: "SBP, Teknik & Lain-lain",       count: 313,  pct: 3,  color: "bg-muted-foreground/50" },
];

const INSIGHTS = [
  {
    tag: "SELANGOR",
    tagClass: "text-primary bg-primary/10",
    headline: "Selangor Catat Enrolmen Tertinggi — 618 Murid/Sekolah",
    deck: "Dengan 1,847 sekolah, Selangor memimpin bilangan tetapi kesesakan kelas kekal tinggi. Pembangunan pesat kawasan bandar mendorong peningkatan enrolmen.",
    href: "/statistik",
  },
  {
    tag: "LUAR BANDAR",
    tagClass: "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
    headline: "847 Sekolah Bawah 150 Murid — Kebanyakan di Sabah & Sarawak",
    deck: "Hampir 1 dalam 12 sekolah KPM beroperasi dengan enrolmen minimum. Sekolah-sekolah ini menghadapi cabaran penggabungan dan kekurangan tenaga pengajar.",
    href: "/directory",
  },
  {
    tag: "STATISTIK",
    tagClass: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    headline: "72% Sekolah Malaysia Adalah Sekolah Kebangsaan (SK)",
    deck: "Enrolmen SK merangkumi 68% jumlah murid sekolah rendah. SJK(C) dan SJK(T) kekal stabil sejak 2018 tanpa perubahan signifikan dalam bahagian pasaran.",
    href: "/statistik",
  },
];

// ─── Panel header ──────────────────────────────────────────────────────────────

function PanelHeader({
  symbol = "▶",
  title,
  action,
}: {
  symbol?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="text-primary text-[11px] leading-none" aria-hidden>{symbol}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground font-sans">
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

// ─── Panel action link ────────────────────────────────────────────────────────

function PanelAction({ href, label = "SEMUA" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:underline font-sans"
    >
      {label} <ArrowRight className="h-2.5 w-2.5" />
    </Link>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function HomeExplore() {
  await getTranslations("home"); // ensures the module is valid for ISR

  return (
    <div className="px-4 md:px-6 pb-6 space-y-4">

      {/* ── Main grid: state rankings + insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

        {/* ── State rankings panel ── */}
        <div className="border border-border rounded bg-card overflow-hidden">
          <PanelHeader
            symbol="▲"
            title="SEKOLAH MENGIKUT NEGERI"
            action={<PanelAction href="/statistik" />}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="w-8 px-4 py-2 text-left text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold">#</th>
                  <th className="px-3 py-2 text-left text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold">NEGERI</th>
                  <th className="px-4 py-2 text-left text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold hidden sm:table-cell">PERATUS</th>
                  <th className="px-4 py-2 text-right text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold">BILANGAN</th>
                </tr>
              </thead>
              <tbody>
                {STATES_DATA.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono text-muted-foreground text-[10px]">
                      {row.rank}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground text-[12px]">
                      {row.name}
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className={`h-full bg-primary rounded-full stat-bar-wrap stat-bar-wrap-delay-${Math.min(row.rank, 8)}`}
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                          {row.pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                        {row.count.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column: school types + insights ── */}
        <div className="space-y-4">

          {/* School types panel */}
          <div className="border border-border rounded bg-card overflow-hidden">
            <PanelHeader
              symbol="▶"
              title="JENIS SEKOLAH"
              action={<PanelAction href="/statistik" />}
            />
            <div className="p-4 space-y-3">
              {SCHOOL_TYPES.map((st) => (
                <div key={st.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-foreground">{st.type}</span>
                      <span className="text-[10px] text-muted-foreground font-sans ml-1.5">{st.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{st.count.toLocaleString()}</span>
                      <span className="text-[10px] font-mono font-bold text-foreground w-8 text-right">{st.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full stat-bar-wrap ${st.color}`} style={{ width: `${st.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data source note */}
          <div className="border border-border rounded bg-primary/5 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary font-sans mb-1.5">
              SUMBER DATA
            </p>
            <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
              Data daripada{" "}
              <a
                href="https://emisonline.moe.gov.my/risalahmap/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                KPM EMIS Risalah Map
              </a>
              . Lesen CC0 — tiada hak terpelihara. Dikemaskini 2024.
            </p>
          </div>

        </div>
      </div>

      {/* ── Insights panel (full width) ── */}
      <div className="border border-border rounded bg-card overflow-hidden">
        <PanelHeader
          symbol="■"
          title="ANALISIS TERKINI"
          action={<PanelAction href="/statistik" label="STATISTIK" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {INSIGHTS.map((ins) => (
            <Link
              key={ins.headline}
              href={ins.href}
              className="block p-4 hover:bg-muted/30 transition-colors group"
            >
              <span
                className={`inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded font-sans mb-2.5 ${ins.tagClass}`}
              >
                {ins.tag}
              </span>
              <h3 className="font-display font-bold text-[13px] leading-snug text-foreground group-hover:text-primary transition-colors mb-1.5">
                {ins.headline}
              </h3>
              <p className="text-[11px] text-muted-foreground font-sans leading-relaxed line-clamp-3">
                {ins.deck}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary font-sans">
                Lihat Data <ArrowRight className="h-2.5 w-2.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
