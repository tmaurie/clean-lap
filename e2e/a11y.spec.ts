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
  // Les listes de courses ont deux états de ligne. `/calendar` (saison en
  // cours) montre les deux, `?season=2024` une saison entièrement courue, et
  // `/results/{année en cours}` les manches encore à disputer. Tant que
  // `/calendar` était rendu côté navigateur, axe n'auditait que son squelette
  // et ne voyait aucune de ces lignes : l'`opacity` des lignes courues divisait
  // le contraste de chaque enfant (numéro de manche à 2,48 au lieu de 3,54).
  "/calendar?season=2024",
  `/results/${new Date().getFullYear()}`,
  // Les fiches de détail n'étaient pas auditées. Et `ferrari` seule ne
  // suffisait pas : son rouge est assez clair pour passer, là où le bleu
  // Red Bull des intitulés tombait à 3,01:1 pour du texte de 12 px.
  "/drivers/max_verstappen",
  "/teams/red_bull?season=2024",
];

test.describe("accessibilité", () => {
  for (const route of ROUTES) {
    test(`${route} — aucune violation WCAG 2.1 AA`, async ({ page }) => {
      // Les animations d'entrée jouent sur l'opacité, et axe calcule le
      // contraste avec l'opacité effective : on audite la page stabilisée,
      // pas une page à mi-fondu.
      await page.emulateMedia({ reducedMotion: "reduce" });
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

  test("aucune violation avec des favoris marqués", async ({ page }) => {
    // Sans favoris, axe ne voit ni l'étoile pleine, ni la ligne teintée, ni le
    // bloc « Mes favoris » de la home — exactement le piège du calendrier,
    // audité vide pendant des mois.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() =>
      localStorage.setItem(
        "cleanlap.favorites.v1",
        JSON.stringify(["driver:antonelli", "team:mercedes"]),
      ),
    );

    for (const route of ["/standings", "/"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(
        violations.map((v) => ({
          regle: v.id,
          noeuds: v.nodes.length,
          exemple: v.nodes[0]?.html?.slice(0, 120),
        })),
        `violations sur ${route} avec favoris`,
      ).toEqual([]);
    }
  });

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
