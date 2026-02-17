import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LogoPlaceholder } from "@/components/logo-placeholder";
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
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="flex h-9 w-9 items-center justify-center text-primary shrink-0">
                <LogoPlaceholder className="h-9 w-9" />
              </span>
              <span className="font-bold text-lg text-foreground">{t("appName")}</span>
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
              <span
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground/70 cursor-not-allowed"
                aria-disabled="true"
              >
                {t("pageStatistics")}
              </span>
            </nav>
            <div className="flex items-center gap-2">
              <LocaleDropdown />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
          <p>
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
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/legal" className="underline hover:text-foreground">
              {tFooter("cc0License")}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="underline hover:text-foreground">
              {tFooter("privacyPolicy")}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="underline hover:text-foreground">
              {tFooter("termsOfUse")}
            </Link>
          </p>
        </div>
      </footer>
      <CookieConsent />
    </NextIntlClientProvider>
  );
}
