import { afterEach, describe, expect, it, vi } from "vitest";

import driverSeasonFixture from "@/docs/api/driver_result.json";
import driversFixture from "@/docs/api/drivers.json";

import { fetchDriverSeason, fetchDrivers } from "./drivers";

// La fixture regroupe plusieurs réponses de l'API dans un même tableau, donc
// toutes n'ont pas la clé `drivers` : on la lit via un accès tolérant.
const fixtureDrivers = (index: number): unknown[] =>
  (driversFixture as Array<{ drivers?: unknown[] }>)[index]?.drivers ?? [];

// Réponse 0 : la recherche "verstappen" (Max et Jos). Réponse 1 : Vettel.
const verstappenSearch = { drivers: fixtureDrivers(0) };

function stubFetch(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      json: async () => body,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchDrivers", () => {
  it("mappe les pilotes renvoyés par l'API", async () => {
    stubFetch(verstappenSearch);

    const drivers = await fetchDrivers();

    expect(drivers).toHaveLength(2);
    expect(drivers[0]).toMatchObject({
      id: "max_verstappen",
      name: "Max",
      surname: "Verstappen",
      shortName: "VER",
      number: 33,
    });
  });

  it("filtre sur le prénom et sur l'identifiant", async () => {
    stubFetch(verstappenSearch);
    const byFirstName = await fetchDrivers({ search: "max" });
    expect(byFirstName.map((d) => d.id)).toEqual(["max_verstappen"]);

    stubFetch(verstappenSearch);
    const byId = await fetchDrivers({ search: "jos" });
    expect(byId.map((d) => d.id)).toEqual(["verstappen"]);
  });

  it("filtre aussi sur le trigramme", async () => {
    // Deux pilotes dont seuls les trigrammes diffèrent vraiment.
    stubFetch({ drivers: [...fixtureDrivers(0), ...fixtureDrivers(1)] });

    const byShortName = await fetchDrivers({ search: "VET" });
    expect(byShortName.map((d) => d.id)).toEqual(["vettel"]);
  });

  it("est une recherche par sous-chaîne, pas une correspondance exacte", async () => {
    // "ver" est contenu dans "Verstappen" : les deux pilotes remontent.
    stubFetch(verstappenSearch);
    await expect(fetchDrivers({ search: "ver" })).resolves.toHaveLength(2);
  });

  it("ignore la casse et les espaces autour de la recherche", async () => {
    stubFetch(verstappenSearch);
    await expect(
      fetchDrivers({ search: "  VeRsTaPpEn " }),
    ).resolves.toHaveLength(2);
  });

  it("renvoie une liste vide quand l'API échoue", async () => {
    // fetchDrivers avale l'erreur pour ne pas casser la page pilotes.
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(null, 500);

    await expect(fetchDrivers()).resolves.toEqual([]);
  });
});

describe("fetchDriverSeason", () => {
  it("calcule les statistiques de la saison", async () => {
    stubFetch(driverSeasonFixture);

    const season = await fetchDriverSeason("max_verstappen", "2025");

    expect(season?.races).toHaveLength(22);
    expect(season?.stats).toEqual({
      wins: 5,
      podiums: 13,
      points: 356, // 329 en course + 27 en sprint
      avgGrid: 3,
    });
  });

  it("ajoute les points de sprint aux points de course", async () => {
    stubFetch(driverSeasonFixture);

    const season = await fetchDriverSeason("max_verstappen", "2025");
    const withSprint = season?.races.find(
      (race) => (race.sprintPoints ?? 0) > 0,
    );

    expect(withSprint).toBeDefined();
    expect(Number(withSprint?.points)).toBeGreaterThan(
      withSprint?.sprintPoints ?? 0,
    );
  });

  it("ne compte pas un abandon comme un podium", async () => {
    stubFetch(driverSeasonFixture);

    const season = await fetchDriverSeason("max_verstappen", "2025");
    const notClassified = season?.races.filter(
      (race) => race.position === "NC",
    );

    expect(notClassified).toHaveLength(1);
    expect(season?.stats.podiums).toBe(13);
  });

  it("écarte les grilles non numériques de la moyenne", async () => {
    stubFetch(driverSeasonFixture);

    const season = await fetchDriverSeason("max_verstappen", "2025");
    const unusable = season?.races.filter(
      (race) => !Number.isFinite(Number(race.grid)),
    );

    // Deux manches ont "not available" en grille : la moyenne reste finie.
    expect(unusable?.length).toBe(2);
    expect(season?.stats.avgGrid).not.toBeNull();
    expect(Number.isFinite(Number(season?.stats.avgGrid))).toBe(true);
  });

  it("mappe la course, la date et le lieu", async () => {
    stubFetch(driverSeasonFixture);

    const season = await fetchDriverSeason("max_verstappen", "2025");

    expect(season?.races[0]).toMatchObject({
      round: 1,
      raceName: "Louis Vuitton Australian Grand Prix 2025",
      date: "2025-03-16",
      location: "Melbourne, Australia",
      grid: 3,
      position: 2,
    });
  });

  it("renvoie null quand l'API échoue", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubFetch(null, 500);

    await expect(fetchDriverSeason("inconnu", "2025")).resolves.toBeNull();
  });
});
