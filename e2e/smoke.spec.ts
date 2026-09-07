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
  { path: "/teams", label: "Écuries", heading: "Écuries" },
  // Le libellé de navigation est court, le titre de page reste explicite.
  { path: "/compare", label: "Duels", heading: "Comparateur" },
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
  const countdown = page.locator("[data-countdown]");
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

test("une saison hors calendrier rend un 404", async ({ page }) => {
  // La page était un composant client bloqué sur « Chargement… » ; elle est
  // désormais rendue côté serveur et une année hors du calendrier F1
  // (1950 → saison en cours) n'existe pas, donc 404.
  const response = await page.goto("/results/1800");

  expect(response?.status(), "statut HTTP").toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page introuvable",
  );
});

test("une saison du calendrier liste ses manches", async ({ page }) => {
  const response = await page.goto("/results/2021");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Saison 2021",
  );
  await expect(
    page.getByRole("link", { name: /résultats/i }).first(),
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

    const countdown = page.locator("[data-countdown]");
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

test.describe("SEO", () => {
  test("chaque page porte un titre distinct", async ({ page }) => {
    const titres = new Map<string, string>();

    for (const route of [
      "/",
      "/calendar",
      "/standings",
      "/drivers",
      "/results",
    ]) {
      await page.goto(route);
      titres.set(route, await page.title());
    }

    for (const [route, titre] of titres) {
      expect(titre, `titre de ${route}`).toContain("CleanLap");
    }
    // Toutes les pages s'appelaient "CleanLap" auparavant.
    expect(new Set(titres.values()).size, "titres tous distincts").toBe(
      titres.size,
    );
  });

  test("robots.txt renvoie vers le sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("/sitemap.xml");
  });

  test("le sitemap liste les pages et les saisons récentes", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    for (const route of ["/weekend", "/calendar", "/standings", "/drivers"]) {
      expect(xml, `sitemap contient ${route}`).toContain(route);
    }
    expect(xml).toContain(`/results/${new Date().getFullYear()}`);
  });
});

test.describe("fiches écuries", () => {
  test("une écurie affiche palmarès, classement et effectif", async ({
    page,
  }) => {
    const errors = watchForErrors(page);

    const response = await page.goto("/teams/ferrari?season=2024");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Scuderia Ferrari",
    );
    await expect(page.getByText("Titres constructeurs")).toBeVisible();
    await expect(
      page.getByText("Effectif 2024", { exact: false }),
    ).toBeVisible();

    // L'effectif renvoie vers les fiches pilotes.
    await expect(
      page.getByRole("link", { name: /leclerc/i }).first(),
    ).toBeVisible();

    expect(errors, "erreurs console sur /teams/ferrari").toEqual([]);
  });

  test("l'effectif est trié par classement", async ({ request }) => {
    const html = await (await request.get("/teams/ferrari?season=2024")).text();

    // Leclerc (P3) doit apparaître avant Bearman (P18), alors que l'API
    // renvoie le remplaçant en premier.
    expect(html.indexOf("Leclerc")).toBeLessThan(html.indexOf("Bearman"));
  });

  test("une écurie inconnue rend un 404", async ({ page }) => {
    const response = await page.goto("/teams/ecurie-inexistante");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page introuvable",
    );
  });

  test("la saison de l'écurie vient de l'URL", async ({ page }) => {
    await page.goto("/teams/ferrari?season=2021");

    await expect(
      page.locator("main").getByText("Écurie — Saison 2021"),
    ).toBeVisible();
  });

  test("le classement constructeurs mène aux fiches écuries", async ({
    page,
  }) => {
    await page.goto("/standings?season=2024");
    await page.getByRole("button", { name: "Écuries" }).click();

    const lien = page
      .locator("main")
      .getByRole("link", { name: /ferrari|mclaren|red bull|mercedes/i })
      .first();
    await expect(lien).toBeVisible();

    await lien.click();
    await expect(page).toHaveURL(/\/teams\//);
    await expect(page.getByText("Titres constructeurs")).toBeVisible();
  });
});

test.describe("index des écuries", () => {
  test("liste les écuries de la saison et mène à leur fiche", async ({
    page,
  }) => {
    const errors = watchForErrors(page);

    const response = await page.goto("/teams?season=2024");
    expect(response?.status()).toBe(200);

    const cartes = page.locator("main").getByRole("listitem");
    expect(await cartes.count()).toBeGreaterThanOrEqual(9);

    await page
      .getByRole("link", { name: /ferrari/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/teams\/ferrari/);
    await expect(page.getByText("Titres constructeurs")).toBeVisible();

    expect(errors, "erreurs console sur /teams").toEqual([]);
  });

  test("une saison sans championnat constructeurs l'explique", async ({
    page,
  }) => {
    // Le championnat constructeurs n'existe que depuis 1958 : mieux vaut le
    // dire qu'afficher une liste vide.
    await page.goto("/teams?season=1955");

    await expect(page.getByText(/n'existe que depuis 1958/i)).toBeVisible();
  });
});

test.describe("navigation responsive", () => {
  // L'en-tête débordait dès 768 px, même avec cinq entrées : la page
  // scrollait alors horizontalement. La bascule est passée à `lg`.
  for (const width of [320, 768, 1023, 1024, 1440]) {
    test(`aucun débordement horizontal à ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/teams");

      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth, `débordement à ${width} px`).toBeLessThanOrEqual(
        innerWidth,
      );

      // Exactement une navigation visible, jamais zéro ni deux.
      const visibles = await page.evaluate(() => {
        const navs = [...document.querySelectorAll("nav")];
        const bas = navs.find((n) => n.className.includes("fixed bottom-0"));
        const haut = document.querySelector("header nav");
        const vu = (el: Element | null | undefined) =>
          !!el && getComputedStyle(el).display !== "none";
        return [vu(haut), vu(bas)].filter(Boolean).length;
      });
      expect(visibles, `navigations visibles à ${width} px`).toBe(1);
    });
  }
});

test.describe("comparateur de pilotes", () => {
  test("compare deux pilotes sur une saison", async ({ page }) => {
    const errors = watchForErrors(page);

    const response = await page.goto(
      "/compare?season=2024&d1=max_verstappen&d2=leclerc",
    );
    expect(response?.status()).toBe(200);

    await expect(page.getByText("Duels directs")).toBeVisible();
    await expect(page.getByText("En qualification")).toBeVisible();

    expect(errors, "erreurs console sur /compare").toEqual([]);
  });

  test("les chiffres concordent avec le classement officiel", async ({
    request,
  }) => {
    // L'endpoint /compare de f1api.dev intervertit les deux pilotes : il
    // attribuait à Leclerc les 9 victoires et les 437 points de Verstappen.
    // Tout est donc recalculé depuis /api/{saison}/drivers/{id}.
    const html = await (
      await request.get("/compare?season=2024&d1=max_verstappen&d2=leclerc")
    ).text();

    const texte = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(texte).toMatch(/437[\s\S]{0,40}Points[\s\S]{0,40}356/);
    expect(texte).toMatch(/9[\s\S]{0,40}Victoires[\s\S]{0,40}3/);
  });

  test("refuse de comparer un pilote à lui-même", async ({ page }) => {
    await page.goto("/compare?season=2024&d1=leclerc&d2=leclerc");

    await expect(
      page.getByText(/choisissez deux pilotes différents/i),
    ).toBeVisible();
  });

  test("la fiche pilote mène au comparateur pré-rempli", async ({ page }) => {
    await page.goto("/drivers/leclerc?season=2024");

    await page
      .getByRole("link", { name: /comparer à un autre pilote/i })
      .click();
    await expect(page).toHaveURL(/\/compare\?.*d1=leclerc/);
  });
});
