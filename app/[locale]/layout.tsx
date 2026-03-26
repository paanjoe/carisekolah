import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { CookieConsent } from "@/components/cookie-consent";
import { SidebarLayout } from "@/components/sidebar-layout";

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

  const navItems = [
    { href: "/",                label: t("home") },
    { href: "/directory",       label: t("directory") },
    { href: "/peta",            label: t("map") },
    { href: "/statistik",       label: t("schoolStatistics") },
    { href: "/compare",         label: t("compare") },
    { href: "/facility",        label: t("facilityUpgrades") },
    { href: "/page-statistics", label: t("pageStatistics") },
    { href: "/data-catalogue",  label: t("dataCatalogue") },
  ];

  const footer = (
    <footer className="border-t border-border bg-sidebar py-4 px-6 shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] text-muted-foreground font-sans">
        <p>
          {tFooter("broughtToYouByPrefix")}
          <a
            href="https://civictech.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80 ml-0.5"
          >
            {tFooter("broughtToYouByOrg")}
          </a>
          {" · "}
          <a
            href="https://emisonline.moe.gov.my/risalahmap/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {tFooter("dataSourceLink")}
          </a>
        </p>
        <div className="flex items-center gap-3">
          <Link href="/legal"   className="hover:text-foreground transition-colors">{tFooter("cc0License")}</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">{tFooter("privacyPolicy")}</Link>
          <Link href="/terms"   className="hover:text-foreground transition-colors">{tFooter("termsOfUse")}</Link>
          <a
            href="https://github.com/paanjoe/carisekolah"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );

  return (
    <NextIntlClientProvider messages={messages}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        {t("skipToMainContent")}
      </a>

      <SidebarLayout appName={t("appName")} navItems={navItems} footer={footer}>
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </SidebarLayout>

      <CookieConsent />
    </NextIntlClientProvider>
  );
}
