import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleDropdown } from "@/components/locale-dropdown";
import { CookieConsent } from "@/components/cookie-consent";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("common");
  const tFooter = await getTranslations("footer");

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between gap-6">
            <Link href="/" className="shrink-0 flex items-center">
              <span className="font-bold text-lg text-black dark:text-foreground uppercase">{t("appName")}</span>
              <span className="ml-1.5" aria-hidden>🇲🇾</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("home")}
              </Link>
              <Link
                href="/directory"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("directory")}
              </Link>
              <Link
                href="/peta"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("map")}
              </Link>
              <Link
                href="/statistik"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("schoolStatistics")}
              </Link>
              <Link
                href="/compare"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("compare")}
              </Link>
              <Link
                href="/facility"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("facilityUpgrades")}
              </Link>
              <Link
                href="/page-statistics"
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {t("pageStatistics")}
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <LocaleDropdown />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 text-sm md:grid-cols-3 md:gap-4">
            <div>
              <p className="text-2xl font-bold text-black dark:text-foreground uppercase flex items-center gap-1.5">
                {t("appName")}
                <span aria-hidden>🇲🇾</span>
              </p>
              <p className="mt-1 text-muted-foreground">
                {tFooter("dataSourcePrefix")}
                <a
                  href="https://emisonline.moe.gov.my/risalahmap/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {tFooter("dataSourceLink")}
                </a>
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground">{tFooter("openSource")}</p>
              <p className="mt-1 text-muted-foreground">
                <a
                  href="https://github.com/paanjoe/carisekolah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {tFooter("githubRepo")}
                </a>
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground">{tFooter("legal")}</p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                <Link href="/legal" className="underline hover:text-foreground">
                  {tFooter("cc0License")}
                </Link>
                <Link href="/privacy" className="underline hover:text-foreground">
                  {tFooter("privacyPolicy")}
                </Link>
                <Link href="/terms" className="underline hover:text-foreground">
                  {tFooter("termsOfUse")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
