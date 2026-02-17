import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MapPin, BarChart3, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export async function HomeExplore() {
  const t = await getTranslations("home");

  const cards = [
    {
      href: "/peta",
      icon: MapPin,
      titleKey: "cardMapTitle" as const,
      descKey: "cardMapDesc" as const,
    },
    {
      href: "/statistik",
      icon: BarChart3,
      titleKey: "cardStatsTitle" as const,
      descKey: "cardStatsDesc" as const,
    },
    {
      href: "/directory",
      icon: Search,
      titleKey: "cardSearchTitle" as const,
      descKey: "cardSearchDesc" as const,
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <p className="text-sm font-medium text-primary uppercase tracking-wide">{t("exploreTitle")}</p>
      <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{t("exploreSubtitle")}</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, icon: Icon, titleKey, descKey }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-shadow hover:shadow-md border-border">
              <CardContent className="p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{t(titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(descKey)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
