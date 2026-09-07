import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Garde-fou d'accessibilité. L'audit initial relevait 65 nœuds en violation
 * sur 9 routes (contraste, boutons sans nom, liens distingués par la seule
 * couleur) ; ce test échoue si l'un d'eux revient.
 *
 * axe ne couvre pas tout — le focus clavier, les légendes de tableau et le
 * comportement du compte à rebours sont vérifiés séparément plus bas.
 */
const ROUTES = [
  "/",
  "/weekend",
  "/calendar",
  "/drivers",
  "/teams",
  "/teams/ferrari?season=2024",
  "/compare?season=2024&d1=max_verstappen&d2=leclerc",
  "/circuits",
  "/circuits/monza?season=2024",
  "/standings",
  "/results",
  "/results/2024/1",
];

test.describe("accessibilité", () => {
  for (const route of ROUTES) {
    test(`${route} — aucune violation WCAG 2.1 AA`, async ({ page }) => {
      await page.goto(route);

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(
        violations.map((v) => ({
          regle: v.id,
          gravite: v.impact,
          noeuds: v.nodes.length,
          exemple: v.nodes[0]?.html?.slice(0, 120),
        })),
        `violations sur ${route}`,
      ).toEqual([]);
    });
  }

  test("les tableaux de résultats ont une légende", async ({ page }) => {
    await page.goto("/results/2024/1");

    // Six onglets sur la même page : sans légende, un lecteur d'écran ne
    // distingue pas les tableaux entre eux.
    const caption = page.locator("table caption");
    await expect(caption.first()).toHaveText(/classement de la course/i);
  });

  test("le compte à rebours annonce un résumé, pas des chiffres qui défilent", async ({
    page,
  }) => {
    await page.goto("/");

    const countdown = page.locator("[data-countdown]");
    test.skip(!(await countdown.isVisible()), "pas de course à venir");

    // Les chiffres animés sont masqués aux lecteurs d'écran : un `aria-live`
    // sur un compteur à la seconde rendrait la page inutilisable.
    await expect(countdown.locator("[aria-live]")).toHaveCount(0);
    await expect(countdown.locator(".sr-only")).toContainText(/départ dans/i);
  });

  test("les éléments interactifs ont un indicateur de focus", async ({
    page,
  }) => {
    await page.goto("/");

    // Les onze CTA écrits à la main n'en avaient aucun avant.
    const cta = page.getByRole("link", { name: /voir le week-end/i }).first();
    test.skip(!(await cta.isVisible()), "pas de course à venir");

    await cta.focus();
    const outline = await cta.evaluate((el) => {
      const s = getComputedStyle(el);
      return { width: s.outlineWidth, style: s.outlineStyle };
    });

    expect(outline.style).not.toBe("none");
    expect(parseFloat(outline.width)).toBeGreaterThan(0);
  });
});
