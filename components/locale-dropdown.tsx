"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import type { Locale } from "@/i18n/config";

const localeLabels: Record<Locale, string> = {
  ms: "Bahasa Malaysia",
  en: "English",
};

const localeShort: Record<Locale, string> = {
  ms: "BM",
  en: "EN",
};

export function LocaleDropdown() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function onValueChange(newLocale: string) {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale as Locale });
  }

  return (
    <Select value={locale} onValueChange={onValueChange}>
      <SelectTrigger className="w-fit min-w-0 h-9 border-border bg-transparent gap-1.5">
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
        <SelectValue>{localeShort[locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ms">{localeLabels.ms}</SelectItem>
        <SelectItem value="en">{localeLabels.en}</SelectItem>
      </SelectContent>
    </Select>
  );
}
