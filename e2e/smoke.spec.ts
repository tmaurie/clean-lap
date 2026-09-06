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

test("une manche inexistante rend un 404, pas une 500", async ({ page }) => {
  const errors = watchForErrors(page);

  // f1api.dev répond 404 sur une manche hors calendrier. Avant, l'exception
  // remontait jusqu'au serveur et toute URL mal saisie donnait une 500.
  const response = await page.goto("/results/2024/999");

  expect(response?.status(), "statut HTTP").toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page introuvable",
  );

  expect(errors, "erreurs console sur la page 404").toEqual([]);
});

test("un pilote inconnu rend un 404", async ({ page }) => {
  // Verrouille la contrainte documentée dans components/skeletons/README.md :
  // pas de `loading.tsx` sur une route qui appelle `notFound()`, sinon le
  // streaming renvoie 200.
  const response = await page.goto("/drivers/pilote-inexistant");

  expect(response?.status(), "statut HTTP").toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page introuvable",
  );
});

test("une URL inconnue rend la page 404 de l'app", async ({ page }) => {
  const response = await page.goto("/cette-page-nexiste-pas");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page introuvable",
  );
  // La page 404 doit ramener quelque part.
  await expect(
    page.getByRole("link", { name: /retour à l'accueil/i }),
  ).toBeVisible();
});

test("une saison hors calendrier affiche un état vide, pas un chargement infini", async ({
  page,
}) => {
  await page.goto("/results/1800");

  // La promesse rejetée laissait la page bloquée sur « Chargement… ».
  await expect(
    page.getByRole("heading", { name: /saison indisponible/i }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByRole("link", { name: /choisir une autre saison/i }),
  ).toBeVisible();
});

/**
 * Les pages calendrier / classements / pilotes chargent leurs données depuis
 * le navigateur : on peut donc retenir la réponse de f1api.dev et observer
 * l'état de chargement de façon déterministe, au lieu de courir après une
 * fenêtre de quelques millisecondes.
 */
async function slowDownApi(page: Page, delayMs = 4000) {
  await page.route("**://f1api.dev/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.continue();
  });
}

test.describe("états de chargement", () => {
  test("le calendrier affiche un squelette annoncé, pas une page vide", async ({
    page,
  }) => {
    await slowDownApi(page);
    await page.goto("/calendar");

    // Avant, la page s'affichait avec des compteurs à 0 et aucune indication.
    await expect(
      page.getByRole("status").filter({ hasText: /chargement du calendrier/i }),
    ).toBeAttached();

    // Et surtout : pas de "0 manches" trompeur pendant le chargement.
    await expect(page.getByText("Manches").locator("..")).toContainText("—");
  });

  test("le squelette disparaît une fois les données arrivées", async ({
    page,
  }) => {
    await page.goto("/calendar");

    await expect(page.getByRole("status")).toHaveCount(0, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Calendrier",
    );
  });
});

test.describe("optimisations", () => {
  test("le compte à rebours se suspend quand la page est masquée", async ({
    page,
  }) => {
    await page.goto("/");

    const countdown = page.getByLabel("Temps restant avant le départ");
    test.skip(
      !(await countdown.isVisible()),
      "pas de course à venir : pas de compte à rebours",
    );

    const seconds = () =>
      countdown.locator("span.font-mono").last().innerText();
    await expect.poll(seconds).not.toBe("--");

    // Chromium headless garde `document.hidden` à false même en ouvrant un
    // autre onglet (vérifié) : on pilote donc directement la propriété que le
    // composant observe, ce qui teste bien notre gestionnaire et non le
    // comportement du navigateur.
    const setHidden = (hidden: boolean) =>
      page.evaluate((value) => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          get: () => value,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);

    await setHidden(true);
    const avant = await seconds();
    await page.waitForTimeout(3000);

    expect(await seconds(), "valeur figée tant que la page est masquée").toBe(
      avant,
    );

    // De retour au premier plan, le décompte se resynchronise immédiatement.
    await setHidden(false);
    await expect.poll(seconds, { timeout: 5000 }).not.toBe(avant);
  });
});

/**
 * Classements et pilotes chargeaient leurs données via React Query, depuis le
 * navigateur. Ils sont désormais rendus côté serveur — et la librairie a
 * disparu de l'application. On le vérifie sur la réponse HTTP elle-même :
 * si la donnée est dans le HTML servi, elle ne vient pas d'un fetch client.
 *
 * (On ne peut pas simplement couper JavaScript : ces routes ont un
 * `loading.tsx`, et l'injection du contenu streamé passe par des scripts
 * inline.)
 */
test.describe("rendu serveur", () => {
  test("le classement pilotes est dans le HTML servi", async ({ request }) => {
    const response = await request.get("/standings");
    expect(response.status()).toBe(200);

    const html = await response.text();
    expect(html).toContain("Classements");
    // Une écurie réelle : la donnée vient bien du serveur.
    expect(html).toMatch(/Red Bull|Ferrari|Mercedes|McLaren/);
  });

  // Ces deux-là passent par la page rendue : la saison est un nœud texte
  // distinct, donc absente telle quelle du HTML brut. On cible `main` pour
  // éviter le badge de saison de l'en-tête.
  test("la saison des classements vient de l'URL", async ({ page }) => {
    await page.goto("/standings?season=2021");

    await expect(
      page.locator("main").getByText("Championnat du monde — Saison 2021"),
    ).toBeVisible();
  });

  test("une saison invalide retombe sur la saison en cours", async ({
    page,
  }) => {
    await page.goto("/standings?season=1066");

    const annee = new Date().getFullYear();
    await expect(
      page.locator("main").getByText(`Championnat du monde — Saison ${annee}`),
    ).toBeVisible();
  });

  test("la liste des pilotes est dans le HTML servi", async ({ request }) => {
    const html = await (await request.get("/drivers")).text();

    expect(html).toContain("Pilotes");
    expect(html).toMatch(/Verstappen|Hamilton|Leclerc|Norris|Russell/);
  });

  test("la saison des pilotes vient de l'URL", async ({ request }) => {
    const html = await (await request.get("/drivers?season=2020")).text();

    expect(html).toMatch(/Verstappen|Hamilton|Bottas|Vettel/);
  });
});
