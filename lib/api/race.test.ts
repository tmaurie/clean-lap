import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import qualyFixture from "@/docs/api/qualy_results.json";
import raceResultFixture from "@/docs/api/race_result.json";
import seasonFixture from "@/docs/api/season.json";
import sprintFixture from "@/docs/api/sprint_results.json";

// unstable_cache enveloppe certains appels ; en test on veut juste la fonction.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

const {
  fetchFreePracticeResults,
  fetchQualifyingResults,
  fetchRaceResults,
  fetchRaces,
  fetchSprintResults,
} = await import("./race");

type Route = { status?: number; body?: unknown };

function stubFetch(routes: Record<string, Route>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const match = Object.keys(routes).find((fragment) =>
      url.includes(fragment),
    );

    if (!match) {
      throw new Error(`Aucune route de test ne correspond à ${url}`);
    }

    const { status = 200, body } = routes[match];
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      json: async () => body,
    } as Response;
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchRaces", () => {
  beforeEach(() => {
    stubFetch({ "/api/2025": { body: seasonFixture } });
  });

  it("reprend le numéro de manche de l'API plutôt que l'index du tableau", async () => {
    const races = await fetchRaces("2025");

    expect(races).toHaveLength(24);
    expect(races[0].round).toBe(1);
    // La régression à éviter : déduire la manche de la position dans le tableau.
    expect(races.map((race) => race.round)).toEqual(
      seasonFixture.races.map((race) => race.round),
    );
  });

  it("mappe le nom, le circuit et le lieu", async () => {
    const [first] = await fetchRaces("2025");

    expect(first.name).toBe("Louis Vuitton Australian Grand Prix 2025");
    expect(first.circuit).toBe("Albert Park Circuit");
    expect(first.location).toBe("Melbourne, Australia");
    expect(first.date).toBe("2025-03-16");
    expect(first.time).toBe("04:00:00Z");
  });
});

describe("fetchRaces sans horaire", () => {
  it("renvoie null plutôt qu'undefined quand l'heure manque", async () => {
    stubFetch({
      "/api/1950": {
        body: {
          races: [
            {
              raceName: "British Grand Prix 1950",
              round: 1,
              date: "1950-05-13",
              circuit: {
                circuitName: "Silverstone",
                city: "Silverstone",
                country: "UK",
              },
            },
          ],
        },
      },
    });

    const [race] = await fetchRaces("1950");
    expect(race.time).toBeNull();
    expect(race.round).toBe(1);
  });

  it("laisse round à null si l'API ne le fournit pas", async () => {
    stubFetch({
      "/api/1950": {
        body: { races: [{ raceName: "GP", date: "1950-05-13" }] },
      },
    });

    const [race] = await fetchRaces("1950");
    expect(race.round).toBeNull();
  });
});

describe("fetchQualifyingResults", () => {
  beforeEach(() => {
    stubFetch({ "/qualy": { body: qualyFixture } });
  });

  it("ne marque qu'un seul meilleur temps par session", async () => {
    const { results } = await fetchQualifyingResults("2024", "1");

    expect(results.filter((r) => r.isFastestQ1)).toHaveLength(1);
    expect(results.filter((r) => r.isFastestQ2)).toHaveLength(1);
    expect(results.filter((r) => r.isFastestQ3)).toHaveLength(1);
  });

  it("désigne le bon pilote dans chaque session", async () => {
    const { results } = await fetchQualifyingResults("2024", "1");
    const fastestIn = (flag: "isFastestQ1" | "isFastestQ2" | "isFastestQ3") =>
      results.find((r) => r[flag])?.driver;

    // Bahreïn 2024 : Sainz en Q1 (1:29:909), Leclerc en Q2 (1:29:165),
    // Verstappen en Q3 (1:29:179).
    expect(fastestIn("isFastestQ1")).toBe("Carlos Sainz");
    expect(fastestIn("isFastestQ2")).toBe("Charles Leclerc");
    expect(fastestIn("isFastestQ3")).toBe("Max Verstappen");
  });

  it("reprend le classement de la séance depuis gridPosition", async () => {
    const { results } = await fetchQualifyingResults("2024", "1");

    expect(results[0].position).toBe("1");
    expect(results[0].driver).toBe("Max Verstappen");
    expect(results[1].position).toBe("2");
    expect(results[1].driver).toBe("Charles Leclerc");
  });
});

describe("fetchRaceResults", () => {
  it("classe premier le vrai meilleur tour", async () => {
    stubFetch({ "/race": { body: raceResultFixture } });

    const { results } = await fetchRaceResults("2025", "21");
    const ranked = results.filter((r) => r.fastestLap?.rank === "1");

    // Albon signe 1:12.400, devant Verstappen (1:12.447).
    expect(ranked).toHaveLength(1);
    expect(ranked[0].driver).toBe("Alex Albon");
    expect(ranked[0].fastestLap?.time).toBe("1:12.400");
  });

  it("laisse fastestLap indéfini quand le pilote n'a pas de tour chronométré", async () => {
    stubFetch({ "/race": { body: raceResultFixture } });

    const { results } = await fetchRaceResults("2025", "21");
    const bortoleto = results.find((r) => r.driver === "Gabriel Bortoleto");

    expect(bortoleto?.fastestLap).toBeUndefined();
  });

  it("accepte un circuit renvoyé comme tableau d'un élément", async () => {
    // L'API renvoie `circuit` en objet sur /last, en tableau sur une manche
    // explicite : les deux formes doivent produire le même résultat.
    stubFetch({
      "/race": {
        body: {
          races: {
            raceName: "GP de test",
            date: "2025-11-09",
            circuit: [
              {
                circuitName: "Interlagos",
                city: "São Paulo",
                country: "Brazil",
              },
            ],
            results: [],
          },
        },
      },
    });

    const race = await fetchRaceResults("2025", "21");
    expect(race.circuit.name).toBe("Interlagos");
    expect(race.location).toBe("São Paulo, Brazil");
  });
});

describe("fetchSprintResults", () => {
  it("mappe les résultats du sprint", async () => {
    stubFetch({ "/sprint/race": { body: sprintFixture } });

    const { results } = await fetchSprintResults("2025", "1");

    expect(results).toHaveLength(20);
    expect(results[0].driver).toBe("Max Verstappen");
    expect(results[0].position).toBe("1");
    expect(results[0].grid).toBe("4");
    expect(results[0].points).toBe("8");
  });

  it("renvoie une liste vide sur un 404 plutôt que de lever", async () => {
    // La majorité des manches n'ont pas de sprint : le 404 est un cas normal.
    stubFetch({ "/sprint/race": { status: 404 } });

    await expect(fetchSprintResults("2005", "3")).resolves.toEqual({
      results: [],
    });
  });

  it("lève sur une vraie erreur serveur", async () => {
    stubFetch({ "/sprint/race": { status: 500 } });

    await expect(fetchSprintResults("2025", "1")).rejects.toThrow();
  });
});

describe("fetchFreePracticeResults", () => {
  it("renvoie une liste vide sur un 404", async () => {
    stubFetch({ "/fp1": { status: 404 } });

    await expect(fetchFreePracticeResults("1998", "3", "fp1")).resolves.toEqual(
      { results: [] },
    );
  });
});
