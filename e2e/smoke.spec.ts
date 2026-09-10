import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

declare global {
  interface Window {
    __notifs: { titre: string; corps?: string }[];
  }
}

/**
 * Smoke test : chaque route doit répondre 200, afficher son contenu principal
 * et ne produire aucune erreur en console. Le dernier point n'est pas
 * décoratif : c'est ce qui attrape les erreurs d'hydratation, invisibles à
 * l'œil nu et jamais couvertes par les tests unitaires.
 *
 * ⚠️ Limite connue, vérifiée : sous le volume de requêtes de la suite complète,
 * f1api.dev finit par répondre **403 Forbidden** — y compris sur des URL
 * valides. Les trois tests de 404 (`/results/{saison}/999`,
 * `/teams/{inconnue}`, `/circuits/{inconnu}`) tombent alors à 500, parce qu'un
 * 403 est une vraie panne amont et non un « ça n'existe pas » : le distinguer
 * est exactement ce que fait `fetchApiOrNull`, et il a raison de le faire.
 * Joués isolément, ces trois tests passent. C'est pourquoi la CI donne
 * `retries: 2` à ce job et le sépare de lint / types / build.
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
test.describe("états de chargement", () => {
  test("le calendrier diffuse un squelette annoncé avant ses données", async ({
    request,
  }) => {
    // Le calendrier n'est plus chargé depuis le navigateur : son attente se
    // joue pendant le rendu serveur, et `loading.tsx` part dans le premier
    // flux. On lit donc le flux lui-même — piloter un clic serait à la merci
    // du préchargement de Next, qui rend la navigation instantanée.
    const html = await (await request.get("/calendar")).text();

    const squelette = html.indexOf("Chargement du calendrier");
    const donnees = html.indexOf("Grands Prix");

    expect(squelette, "squelette absent du flux").toBeGreaterThan(-1);
    expect(donnees, "données absentes du flux").toBeGreaterThan(-1);
    // L'ordre compte : le squelette précède les données, c'est bien un état
    // d'attente et non un résidu.
    expect(squelette).toBeLessThan(donnees);

    // Et il n'annonce aucun compteur, plutôt que le « 0 manches » trompeur
    // d'avant.
    expect(html.slice(0, squelette)).not.toContain("Manches");
  });

  test("le calendrier affiche ses vrais compteurs une fois rendu", async ({
    page,
  }) => {
    await page.goto("/calendar");

    await expect(page.getByRole("status")).toHaveCount(0, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Calendrier",
    );

    const manches = page.getByText("Manches").locator("..");
    await expect(manches).not.toContainText("—");
    await expect(manches).toContainText(/[1-9]\d*/);
  });
});

test.describe("rappel avant la course", () => {
  /**
   * Bouchon de l'API Notification.
   *
   * Chromium sans interface renvoie `Notification.permission === "denied"`
   * quoi qu'on fasse, `grantPermissions` compris : la boîte de dialogue du
   * navigateur n'est donc pas exerçable ici. On bouchonne l'API pour tester ce
   * qui nous appartient — la décision de déclencher, et une seule fois.
   */
  const bouchonNotifications = `
    window.__notifs = [];
    class FauxNotification {
      static permission = "granted";
      static requestPermission() { return Promise.resolve("granted"); }
      constructor(titre, options) {
        window.__notifs.push({ titre, corps: options && options.body });
      }
    }
    window.Notification = FauxNotification;
  `;

  /** Le href de l'export agenda, tel que la page le publie. */
  async function hrefAgenda(page: Page): Promise<string> {
    const lien = page.getByRole("link", {
      name: /ajouter le week-end à mon agenda/i,
    });
    await expect(lien).toBeVisible();
    return (await lien.getAttribute("href")) ?? "";
  }

  test("le week-end s'exporte en calendrier avec une alarme", async ({
    page,
    request,
  }) => {
    await page.goto("/weekend");
    const href = await hrefAgenda(page);
    expect(href).toMatch(/^\/api\/calendar\?season=\d{4}&round=\d+$/);

    const response = await request.get(href);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/calendar");
    expect(response.headers()["content-disposition"]).toContain(".ics");

    const ics = await response.text();
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics).toContain("BEGIN:VEVENT");
    // Le rappel d'une heure, c'est tout l'objet de la fonctionnalité.
    expect(ics).toContain("TRIGGER:-PT60M");
    // Le format impose CRLF : un LF isolé fait rejeter le fichier.
    expect(/(?<!\r)\n/.test(ics)).toBe(false);
  });

  test("la saison entière s'exporte depuis le calendrier", async ({
    page,
    request,
  }) => {
    await page.goto("/calendar");

    const lien = page.getByRole("link", { name: /saison à mon agenda/i });
    await expect(lien).toBeVisible();

    const response = await request.get((await lien.getAttribute("href")) ?? "");
    expect(response.status()).toBe(200);

    const ics = await response.text();
    // Une saison, c'est une vingtaine de manches.
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBeGreaterThan(15);
  });

  test("permission refusée : pas de bouton, mais l'agenda reste proposé", async ({
    page,
  }) => {
    // C'est l'état réel d'un Chromium sans interface, et celui d'un visiteur
    // qui a bloqué le site : la fonctionnalité doit rester utile.
    await page.goto("/weekend");

    await expect(
      page.getByRole("button", { name: /me prévenir/i }),
    ).toHaveCount(0);
    await expect(page.getByText(/notifications sont bloquées/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /ajouter le week-end à mon agenda/i }),
    ).toBeVisible();
  });

  test("le bouton de rappel bascule et se souvient", async ({ page }) => {
    await page.addInitScript(bouchonNotifications);
    await page.goto("/weekend");

    const bouton = page.getByRole("button", { name: /me prévenir/i });
    await expect(bouton).toBeVisible();
    await expect(bouton).toHaveAttribute("aria-pressed", "false");

    await bouton.click();
    const actif = page.getByRole("button", { name: /désactiver le rappel/i });
    await expect(actif).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(
      page.getByRole("button", { name: /désactiver le rappel/i }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: /désactiver le rappel/i }).click();
    await expect(
      page.getByRole("button", { name: /me prévenir/i }),
    ).toBeVisible();
  });

  test("la notification part dans l'heure qui précède, une seule fois", async ({
    page,
    request,
  }) => {
    // On lit le départ réel dans le fichier que la page elle-même publie.
    await page.goto("/weekend");
    const ics = await (await request.get(await hrefAgenda(page))).text();
    const course = ics
      .split("BEGIN:VEVENT")
      .find((bloc) => bloc.includes("-race@cleanlap"));
    const brut = course?.match(/DTSTART:(\d{8}T\d{6}Z)/)?.[1];
    expect(brut, "départ de la course absent du calendrier").toBeTruthy();

    const depart = new Date(
      `${brut!.slice(0, 4)}-${brut!.slice(4, 6)}-${brut!.slice(6, 8)}T${brut!.slice(9, 11)}:${brut!.slice(11, 13)}:${brut!.slice(13, 15)}Z`,
    );

    await page.addInitScript(bouchonNotifications);
    // Deux heures avant : hors de la fenêtre, rien ne doit partir.
    await page.clock.install({
      time: new Date(depart.getTime() - 2 * 3600_000),
    });
    await page.goto("/weekend");

    await page.getByRole("button", { name: /me prévenir/i }).click();
    await expect(
      page.getByRole("button", { name: /désactiver le rappel/i }),
    ).toBeVisible();

    expect(await page.evaluate(() => window.__notifs.length)).toBe(0);

    // 45 minutes avant : dans la fenêtre.
    await page.clock.setSystemTime(new Date(depart.getTime() - 45 * 60_000));
    await page.clock.runFor(60_000);

    await expect
      .poll(() => page.evaluate(() => window.__notifs.length))
      .toBe(1);
    expect(
      await page.evaluate(() => window.__notifs[0].corps as string),
    ).toContain("départ");

    // Et pas de doublon aux tours suivants.
    await page.clock.runFor(5 * 60_000);
    expect(await page.evaluate(() => window.__notifs.length)).toBe(1);
  });
});

test.describe("liste des saisons", () => {
  test("la première page est rendue par le serveur, sans appel à f1api.dev", async ({
    page,
  }) => {
    const errors = watchForErrors(page);
    const versApiAmont: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("f1api.dev")) versApiAmont.push(request.url());
    });

    await page.goto("/results");

    const cartes = page.locator("main a[href^='/results/']");
    await expect(cartes.first()).toBeVisible();
    expect(await cartes.count()).toBe(12);

    // Le point de l'exercice : le navigateur ne parle plus à l'API publique.
    // Avant, la page en faisait 36 au premier rendu.
    expect(versApiAmont, "appels navigateur vers f1api.dev").toEqual([]);
    expect(errors, "erreurs console sur /results").toEqual([]);
  });

  test("le contenu est dans le HTML servi, sans JavaScript", async ({
    request,
  }) => {
    const html = await (await request.get("/results")).text();

    // La page arrivait vide puis se remplissait : rien n'était indexable.
    expect(html).toContain("Champion pilote");
    expect(html).toContain(String(new Date().getFullYear()));
  });

  test("« charger plus » passe par le proxy et ajoute une page", async ({
    page,
  }) => {
    const versProxy: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/seasons")) versProxy.push(request.url());
    });

    await page.goto("/results");
    const cartes = page.locator("main a[href^='/results/']");
    await expect(cartes.first()).toBeVisible();

    await page.getByRole("button", { name: /charger plus/i }).click();
    await expect(cartes).toHaveCount(24);

    expect(versProxy).toHaveLength(1);
    expect(versProxy[0]).toContain("page=2");
  });

  test("le proxy refuse une page qui n'existe pas", async ({ request }) => {
    // Sans ce garde-fou, on partait chercher des années antérieures à 1950.
    for (const page of ["0", "99", "abc", "%202"]) {
      const response = await request.get(`/api/seasons?page=${page}`);
      expect(response.status(), `page=${page}`).toBe(400);
    }

    const ok = await request.get("/api/seasons?page=2");
    expect(ok.status()).toBe(200);
    const { seasons } = (await ok.json()) as { seasons: unknown[] };
    expect(seasons).toHaveLength(12);
  });

  test("le proxy cache plus longtemps les saisons closes", async ({
    request,
  }) => {
    // La page 1 contient la saison en cours, qui bouge chaque week-end ; les
    // suivantes ne contiennent que des saisons définitivement figées.
    const premiere = await request.get("/api/seasons?page=1");
    const suivante = await request.get("/api/seasons?page=3");

    expect(premiere.headers()["cache-control"]).toContain("s-maxage=60");
    expect(suivante.headers()["cache-control"]).toContain("s-maxage=3600");
  });

  test("les sous-routes gardent leur 404 malgré le squelette de la liste", async ({
    page,
  }) => {
    // `app/results/(list)/` est un groupe de routes : sans lui, le
    // `loading.tsx` mettrait `/results/[season]/[round]` en flux et le statut
    // partirait avant que la page puisse appeler `notFound()`.
    const horsCalendrier = await page.goto("/results/1800");
    expect(horsCalendrier?.status()).toBe(404);
  });
});

test.describe("animations d'entrée", () => {
  test("les lignes de classement arrivent en cascade", async ({ page }) => {
    await page.goto("/standings");
    const lignes = page.locator(".cl-stagger > *");
    await expect(lignes.first()).toBeVisible();

    const [premiere, quatrieme] = await Promise.all([
      lignes.nth(0).evaluate((el) => getComputedStyle(el).animationDelay),
      lignes.nth(3).evaluate((el) => getComputedStyle(el).animationDelay),
    ]);

    expect(
      await lignes.nth(0).evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("cl-enter");
    // La cascade : la quatrième ligne démarre après la première.
    expect(parseFloat(quatrieme)).toBeGreaterThan(parseFloat(premiere));
  });

  test("aucune animation quand l'utilisateur les refuse", async ({ page }) => {
    // `prefers-reduced-motion` n'est pas une préférence esthétique : pour
    // certains, le mouvement déclenche des vertiges ou des migraines.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/standings");

    const ligne = page.locator(".cl-stagger > *").first();
    await expect(ligne).toBeVisible();

    const style = await ligne.evaluate((el) => {
      const s = getComputedStyle(el);
      return { animation: s.animationName, opacity: s.opacity };
    });

    expect(style.animation).toBe("none");
    // Et surtout : le contenu reste visible. Couper l'animation sans remettre
    // l'opacité laisserait une page blanche.
    expect(style.opacity).toBe("1");
  });

  test("le podium du dernier GP met le vainqueur au centre", async ({
    page,
  }) => {
    await page.goto("/");

    const marches = page.locator("ol.cl-stagger").first().locator("> li");
    await expect(marches).toHaveCount(3);

    // L'ordre du DOM reste 1, 2, 3 — c'est celui que lit un lecteur d'écran.
    await expect(marches.nth(0)).toContainText("P1");
    await expect(marches.nth(1)).toContainText("P2");
    await expect(marches.nth(2)).toContainText("P3");

    // Mais à l'écran, le vainqueur est au milieu et sa marche est la plus haute.
    const boites = await marches.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect()),
    );
    expect(boites[1].left).toBeLessThan(boites[0].left);
    expect(boites[0].left).toBeLessThan(boites[2].left);
    expect(boites[0].height).toBeGreaterThan(boites[1].height);
    expect(boites[1].height).toBeGreaterThan(boites[2].height);
  });
});

test.describe("favoris", () => {
  const CLE = "cleanlap.favorites.v1";

  test("marquer un pilote depuis le classement le fait apparaître sur la home", async ({
    page,
  }) => {
    const errors = watchForErrors(page);

    await page.goto("/standings");
    const etoiles = page.getByRole("button", { name: /en favori$/ });
    await expect(etoiles.first()).toBeVisible();

    // Le libellé accessible nomme le pilote ; c'est `aria-pressed` qui porte
    // l'état, pas le libellé.
    const premiere = etoiles.first();
    await expect(premiere).toHaveAttribute("aria-pressed", "false");
    const libelle = (await premiere.getAttribute("aria-label")) ?? "";
    const nom = libelle.replace(/ en favori$/, "");

    await premiere.click();
    await expect(premiere).toHaveAttribute("aria-pressed", "true");

    await page.goto("/");
    const bloc = page.locator("section", {
      has: page.getByText("Mes favoris"),
    });
    await expect(bloc.getByRole("listitem")).toHaveCount(1);
    await expect(bloc).toContainText(new RegExp(nom, "i"));
    await expect(bloc).toContainText("Pilote");

    expect(errors, "erreurs console avec favoris").toEqual([]);
  });

  test("la sélection survit à un rechargement et se retire", async ({
    page,
  }) => {
    await page.goto("/standings");
    const etoiles = page.getByRole("button", { name: /en favori$/ });
    await expect(etoiles.first()).toBeVisible();
    await etoiles.first().click();

    await page.reload();
    const apres = page.getByRole("button", { name: /en favori$/ }).first();
    await expect(apres).toHaveAttribute("aria-pressed", "true");

    await apres.click();
    await expect(apres).toHaveAttribute("aria-pressed", "false");

    await page.goto("/");
    // Plus aucun favori : le bloc disparaît au lieu d'afficher une liste vide.
    await expect(page.getByText("Mes favoris")).toHaveCount(0);
  });

  test("une écurie se marque aussi, depuis sa fiche", async ({ page }) => {
    await page.goto("/teams/ferrari?season=2024");

    const etoile = page.getByRole("button", { name: /en favori$/ }).first();
    await expect(etoile).toHaveAttribute("aria-pressed", "false");
    await etoile.click();

    expect(
      await page.evaluate((cle) => localStorage.getItem(cle), CLE),
    ).toContain("team:ferrari");

    await page.goto("/");
    const bloc = page.locator("section", {
      has: page.getByText("Mes favoris"),
    });
    await expect(bloc).toContainText("Écurie");
  });

  test("un favori hors du classement de la saison le dit", async ({ page }) => {
    // Un pilote retiré ne doit pas disparaître en silence du bloc.
    await page.addInitScript(
      ([cle]) =>
        localStorage.setItem(
          cle,
          JSON.stringify(["driver:michael_schumacher"]),
        ),
      [CLE],
    );

    await page.goto("/");
    const bloc = page.locator("section", {
      has: page.getByText("Mes favoris"),
    });
    await expect(bloc).toContainText(/Hors classement \d{4}/);
  });

  test("une sélection corrompue ne casse pas la page", async ({ page }) => {
    const errors = watchForErrors(page);

    await page.addInitScript(
      ([cle]) => localStorage.setItem(cle, "{ pas du json"),
      [CLE],
    );

    await page.goto("/standings");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Classements",
    );
    await expect(
      page.getByRole("button", { name: /en favori$/ }).first(),
    ).toHaveAttribute("aria-pressed", "false");

    expect(errors, "erreurs console avec un stockage corrompu").toEqual([]);
  });
});

test.describe("saison dans l'URL", () => {
  test("le calendrier lit sa saison dans l'URL", async ({ page }) => {
    const response = await page.goto("/calendar?season=2021");
    expect(response?.status()).toBe(200);

    await expect(page.getByText(/Saison 2021/)).toBeVisible();

    // Les données suivent bien la saison demandée : 2021 comptait 22 manches,
    // la saison en cours n'en compte pas le même nombre.
    await expect(
      page.getByText("Manches", { exact: true }).locator(".."),
    ).toContainText("22");

    // Et une saison close ne doit plus rien afficher « à venir » : f1api.dev
    // ne renseigne pas `winner` avant 2024, ce qui affichait autrefois les 22
    // manches comme à disputer.
    await expect(
      page.getByText("Aucune course restante pour cette saison."),
    ).toBeVisible();
  });

  test("changer de saison écrit dans l'URL et le retour arrière fonctionne", async ({
    page,
  }) => {
    await page.goto("/calendar?season=2022");

    await page
      .getByRole("combobox", { name: "Choisir la saison" })
      .first()
      .click();
    await page.getByRole("option", { name: /^2021$/ }).click();

    await expect(page).toHaveURL(/season=2021/);
    await expect(page.getByText(/Saison 2021/)).toBeVisible();

    // C'est tout l'intérêt de l'URL : le retour arrière ramène la saison
    // précédente, ce qu'un `useState` ne permettait pas.
    await page.goBack();
    await expect(page.getByText(/Saison 2022/)).toBeVisible();
  });

  test("le titre de la page porte la saison", async ({ page }) => {
    await page.goto("/calendar?season=2021");
    expect(await page.title()).toContain("2021");
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

    // `page.goto` rend la main dès le premier flux : sur un cache froid, c'est
    // encore le squelette de `loading.tsx`. Sans cette attente le compte
    // tombait à 0 — le test ne passait que quand le serveur était assez rapide.
    const cartes = page.locator("main").getByRole("listitem");
    await expect(cartes.first()).toBeVisible();
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

test.describe("mise en page mobile", () => {
  // Le garde-fou précédent ne visitait que `/teams`, une grille : il ne
  // pouvait rien attraper. Les pages en lignes denses, elles, débordaient —
  // `/calendar` réclamait 601 px sur un écran de 320, soit près du double.
  const PAGES = [
    "/",
    "/weekend",
    "/calendar",
    "/standings",
    "/drivers",
    "/teams",
    "/circuits",
    "/results",
    "/results/2024",
    "/results/2024/1",
    "/drivers/max_verstappen",
    "/teams/ferrari?season=2024",
    "/circuits/monza?season=2024",
    "/compare?season=2024&d1=max_verstappen&d2=leclerc",
  ];

  for (const width of [320, 375, 414]) {
    test(`aucun débordement horizontal à ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const debordements: string[] = [];

      for (const route of PAGES) {
        await page.goto(route);
        // Une page blanche ne déborde jamais : on refuse de conclure sur une
        // page qui n'a pas rendu.
        await expect(page.locator("h1").first()).toBeVisible();

        const { scrollWidth, innerWidth, coupable } = await page.evaluate(
          () => {
            const iw = window.innerWidth;
            const trop = [...document.querySelectorAll("body *")]
              .map((el) => ({ el, r: el.getBoundingClientRect() }))
              .filter((o) => o.r.right > iw + 1 && o.r.width > 0)
              .sort((a, b) => b.r.right - a.r.right)[0];
            return {
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: iw,
              coupable: trop
                ? `${trop.el.tagName.toLowerCase()}.${String(trop.el.className).slice(0, 60)}`
                : "",
            };
          },
        );

        if (scrollWidth > innerWidth) {
          debordements.push(`${route} : ${scrollWidth} px — ${coupable}`);
        }
      }

      expect(debordements, `débordements à ${width} px`).toEqual([]);
    });
  }
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

test.describe("circuits", () => {
  test("la fiche circuit affiche ses caractéristiques et sa manche", async ({
    page,
  }) => {
    const errors = watchForErrors(page);

    const response = await page.goto("/circuits/monza?season=2024");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Autodromo Nazionale Monza",
    );
    await expect(page.getByText("Record du tour")).toBeVisible();
    await expect(page.getByText("Grand Prix 2024")).toBeVisible();

    expect(errors, "erreurs console sur /circuits/monza").toEqual([]);
  });

  test("la date de la manche n'est pas décalée d'un jour", async ({
    request,
  }) => {
    // Sans heure, `toRaceDate` vise 23:59:59 UTC : formaté à Paris, ça
    // basculait au lendemain. Le GP d'Italie 2024 s'affichait « 2 septembre ».
    const html = await (
      await request.get("/circuits/monza?season=2024")
    ).text();

    expect(html).toContain("1 septembre 2024");
    expect(html).not.toContain("2 septembre 2024");
  });

  test("un circuit hors calendrier le dit sans se tromper", async ({
    page,
  }) => {
    await page.goto("/circuits/monza?season=2021");

    // Monza était au calendrier 2021 : le message d'absence ne doit pas
    // s'afficher.
    await expect(page.getByText(/n'est pas au calendrier/i)).toHaveCount(0);
  });

  test("un circuit inconnu rend un 404", async ({ page }) => {
    const response = await page.goto("/circuits/circuit-inexistant");

    expect(response?.status()).toBe(404);
  });

  test("l'index liste les circuits et mène aux fiches", async ({ page }) => {
    await page.goto("/circuits?season=2024");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Circuits",
    );
    const cartes = page.locator("main").getByRole("listitem");
    expect(await cartes.count()).toBeGreaterThanOrEqual(20);

    await cartes.first().getByRole("link").click();
    await expect(page).toHaveURL(/\/circuits\/[a-z_]+/);
  });

  test("le calendrier mène à l'index des circuits", async ({ page }) => {
    await page.goto("/calendar");

    await page.getByRole("link", { name: /voir tous les circuits/i }).click();
    await expect(page).toHaveURL(/\/circuits/);
  });
});
