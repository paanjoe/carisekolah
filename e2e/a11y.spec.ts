import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const LOCALE = "en";

const KEY_PAGES = [
  { path: `/${LOCALE}`, name: "Home" },
  { path: `/${LOCALE}/directory`, name: "Directory" },
  { path: `/${LOCALE}/peta`, name: "Map" },
  { path: `/${LOCALE}/statistik`, name: "Statistics" },
  { path: `/${LOCALE}/page-statistics`, name: "Page statistics" },
  { path: `/${LOCALE}/JBA0001`, name: "School detail" },
];

test.describe("Accessibility (WCAG 2.1)", () => {
  for (const { path, name } of KEY_PAGES) {
    test(`${name} (${path}) has no critical axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const critical = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      );
      if (critical.length > 0) {
        const msg = critical
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.help}\n  ${v.nodes.length} node(s). ${v.helpUrl}`
          )
          .join("\n\n");
        expect(critical, `Critical/serious a11y violations on ${path}:\n${msg}`).toEqual([]);
      }
    });
  }
});
