import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * Smoke test : chaque route doit répondre 200, afficher son contenu principal
 * et ne produire aucune erreur en console. Le dernier point n'est pas
 * décoratif : c'est ce qui attrape les erreurs d'hydratation, invisibles à
 * l'œil nu et jamais couvertes par les tests unitaires.
 */

/** Bruit indépendant du code applicatif (extensions, ressources annexes). */
const IGNORED_ERRORS = [
  /favicon/i,
  /Failed to load resource/i,
  /net::ERR_/i,
  /Download the React DevTools/i,
];

function watchForErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (IGNORED_ERRORS.some((pattern) => pattern.test(text))) return;
    errors.push(`console: ${text}`);
  });

  return errors;
}

const ROUTES = [
  { path: "/", label: "Accueil" },
  { path: "/weekend", label: "Week-end" },
  { path: "/calendar", label: "Calendrier", heading: "Calendrier" },
  { path: "/drivers", label: "Pilotes", heading: "Pilotes" },
  { path: "/standings", label: "Classements", heading: "Classements" },
  { path: "/results", label: "Résultats", heading: "Résultats" },
] as const;

test.describe("routes principales", () => {
  for (const route of ROUTES) {
    test(`${route.label} (${route.path}) répond et s'affiche`, async ({
      page,
    }) => {
      const errors = watchForErrors(page);

      const response = await page.goto(route.path);
      expect(response?.status(), `statut HTTP de ${route.path}`).toBe(200);

      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();

      if ("heading" in route && route.heading) {
        await expect(heading).toHaveText(route.heading);
      } else {
        // Le titre de la home est le nom du prochain Grand Prix : variable,
        // mais jamais vide.
        await expect(heading).not.toBeEmpty();
      }

      // La navigation globale doit être rendue sur chaque page.
      await expect(
        page.getByRole("navigation").first().getByRole("link").first(),
      ).toBeVisible();

      expect(errors, `erreurs console sur ${route.path}`).toEqual([]);
    });
  }
});

test("la home affiche le compte à rebours sans erreur d'hydratation", async ({
  page,
}) => {
  const errors = watchForErrors(page);

  await page.goto("/");

  // Le compte à rebours est le composant qui provoquait le mismatch
  // d'hydratation : on vérifie qu'il finit par afficher de vrais chiffres.
  const countdown = page.getByLabel("Temps restant avant le départ");
  const raceOver = page.getByText("C'est l'heure de la course");

  await expect(countdown.or(raceOver).first()).toBeVisible();

  if (await countdown.isVisible()) {
    await expect(countdown).not.toContainText("--", { timeout: 20_000 });
  }

  expect(errors, "erreurs console sur la home").toEqual([]);
});

test("une manche passée affiche son classement complet", async ({ page }) => {
  const errors = watchForErrors(page);

  const response = await page.goto("/results/2024/1");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();

  const raceTable = page.getByRole("table").first();
  await expect(raceTable).toBeVisible();
  // 20 pilotes au départ à Bahreïn 2024.
  await expect(raceTable.locator("tbody tr")).toHaveCount(20);

  expect(errors, "erreurs console sur /results/2024/1").toEqual([]);
});

test("l'onglet Qualifications charge ses propres résultats", async ({
  page,
}) => {
  await page.goto("/results/2024/1");

  await page.getByRole("tab", { name: "Qualifications" }).click();

  const qualifyingTable = page.getByRole("table").first();
  await expect(
    qualifyingTable.getByRole("columnheader", { name: "Q3" }),
  ).toBeVisible();
  await expect(qualifyingTable.locator("tbody tr")).toHaveCount(20);
});

test("le week-end en cours détaille toutes ses sessions", async ({ page }) => {
  const errors = watchForErrors(page);

  const response = await page.goto("/weekend");
  expect(response?.status()).toBe(200);

  // Hors saison la page affiche un état vide assumé : les deux formes sont
  // valides, ce qui ne l'est pas c'est une erreur ou une page cassée.
  const timeline = page.getByRole("listitem").filter({ hasText: "Course" });
  const emptyState = page.getByRole("heading", {
    name: "Aucun week-end en cours",
  });

  if (await emptyState.isVisible()) {
    expect(errors).toEqual([]);
    return;
  }

  // Un week-end a au moins essais, qualifs et course.
  await expect(page.getByText("Déroulé du week-end")).toBeVisible();
  await expect(timeline.first()).toBeVisible();

  // Chaque session porte un état explicite.
  const statuses = page.getByText(/^(Terminé|En direct|À venir)$/);
  expect(await statuses.count()).toBeGreaterThanOrEqual(3);

  expect(errors, "erreurs console sur /weekend").toEqual([]);
});

test("le CTA de la home mène au week-end", async ({ page }) => {
  await page.goto("/");

  const cta = page.getByRole("link", { name: /voir le week-end/i });
  test.skip(!(await cta.isVisible()), "pas de course à venir : CTA absent");

  await cta.click();
  await expect(page).toHaveURL(/\/weekend$/);
});

test("la navigation principale mène à chaque page", async ({ page }) => {
  await page.goto("/");

  for (const { label, path, heading } of ROUTES.filter((r) => "heading" in r)) {
    await page
      .getByRole("navigation")
      .first()
      .getByRole("link", { name: label })
      .click();

    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      heading as string,
    );
  }
});

// BUG CONNU — ce test échoue volontairement (`test.fail`).
// `/results/2024/999` renvoie actuellement un HTTP 500 : f1api.dev répond 404
// sur une manche inexistante, `fetchJSON` (lib/api/race.ts) lève, et aucun
// `error.tsx` / `not-found.tsx` n'existe dans `app/` pour rattraper. Toute URL
// mal saisie ou tout crawler tombe donc sur une 500.
// Voir l'item « États d'erreur et vide soignés » dans docs/backlog.md.
// Quand ce sera corrigé, Playwright signalera « expected to fail but passed » :
// il suffira alors de retirer le `test.fail()`.
test("une manche inexistante ne casse pas l'app", async ({ page }) => {
  test.fail();

  const response = await page.goto("/results/2024/999");

  // Peu importe la forme retenue (404 ou page vide) : ce qui compte est que
  // le serveur ne renvoie pas une 500.
  expect(response?.status(), "statut HTTP").toBeLessThan(500);
});
