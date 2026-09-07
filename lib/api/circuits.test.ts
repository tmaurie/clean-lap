import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchCircuit,
  fetchCircuitRace,
  fetchCircuitsForSeason,
} from "./circuits";

/** `/api/circuits/{id}` renvoie `circuit` en tableau, et en mètres. */
const MONZA = {
  circuit: [
    {
      circuitId: "monza",
      circuitName: "Autodromo Nazionale Monza",
      country: "Italy",
      city: "Monza",
      circuitLength: 5793,
      lapRecord: "1:21:046",
      firstParticipationYear: 1950,
      numberOfCorners: 11,
      fastestLapDriverId: "barrichelo",
      fastestLapTeamId: "ferrari",
      fastestLapYear: 2004,
      url: "https://en.wikipedia.org/wiki/Monza_Circuit",
    },
  ],
};

/** L'endpoint saison utilise `corners` et une chaîne suffixée. */
const SAISON = {
  season: 2024,
  races: [
    {
      raceName: "Gran Premio d'Italia 2024",
      round: 16,
      schedule: { race: { date: "2024-09-01" } },
      circuit: { circuitId: "monza", circuitName: "Monza", corners: 11 },
      winner: { name: "Charles", surname: "Leclerc" },
      teamWinner: { teamId: "ferrari", teamName: "Scuderia Ferrari" },
    },
    {
      raceName: "GP ailleurs",
      round: 17,
      circuit: [{ circuitId: "baku", circuitName: "Baku" }],
    },
  ],
};

function stubFetch(
  routes: Record<string, { status?: number; body?: unknown }>,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const key = Object.keys(routes).find((f) => url.includes(f));
      if (!key) throw new Error(`Aucune route de test pour ${url}`);
      const { status = 200, body } = routes[key];
      return {
        ok: status >= 200 && status < 300,
        status,
        statusText: String(status),
        json: async () => body,
      } as Response;
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCircuit", () => {
  it("déballe la réponse en tableau et normalise les champs", async () => {
    stubFetch({ "/circuits/monza": { body: MONZA } });

    await expect(fetchCircuit("monza")).resolves.toEqual({
      id: "monza",
      name: "Autodromo Nazionale Monza",
      country: "Italy",
      city: "Monza",
      lengthMeters: 5793,
      corners: 11,
      firstSeason: 1950,
      url: "https://en.wikipedia.org/wiki/Monza_Circuit",
      lapRecord: {
        time: "1:21:046",
        driverId: "barrichelo",
        teamId: "ferrari",
        year: 2004,
      },
    });
  });

  it("accepte la longueur en chaîne suffixée comme en nombre", async () => {
    // `"5793km"` alors que la valeur est en mètres : les deux formes existent.
    stubFetch({
      "/circuits/x": {
        body: { circuit: [{ circuitId: "x", circuitLength: "5793km" }] },
      },
    });

    const circuit = await fetchCircuit("x");
    expect(circuit?.lengthMeters).toBe(5793);
  });

  it("lit `corners` quand `numberOfCorners` est absent", async () => {
    stubFetch({
      "/circuits/x": { body: { circuit: [{ circuitId: "x", corners: 14 }] } },
    });

    expect((await fetchCircuit("x"))?.corners).toBe(14);
  });

  it("ne fabrique pas de record de tour sans temps", async () => {
    stubFetch({
      "/circuits/x": {
        body: { circuit: [{ circuitId: "x", fastestLapDriverId: "x" }] },
      },
    });

    expect((await fetchCircuit("x"))?.lapRecord).toBeNull();
  });

  it("renvoie null sur un circuit inexistant", async () => {
    stubFetch({ "/circuits/": { status: 404 } });

    await expect(fetchCircuit("inconnu")).resolves.toBeNull();
  });
});

describe("fetchCircuitsForSeason", () => {
  it("mappe la liste de la saison", async () => {
    stubFetch({
      "/2024/circuits": {
        body: { circuits: [MONZA.circuit[0], { circuitId: "baku" }] },
      },
    });

    const circuits = await fetchCircuitsForSeason("2024");
    expect(circuits.map((c) => c.id)).toEqual(["monza", "baku"]);
  });

  it("renvoie une liste vide quand la saison n'en a pas", async () => {
    stubFetch({ "/1950/circuits": { status: 404 } });

    await expect(fetchCircuitsForSeason("1950")).resolves.toEqual([]);
  });
});

describe("fetchCircuitRace", () => {
  it("trouve la manche courue sur ce circuit", async () => {
    stubFetch({ "/api/2024": { body: SAISON } });

    await expect(fetchCircuitRace("monza", "2024")).resolves.toEqual({
      round: 16,
      name: "Gran Premio d'Italia 2024",
      date: "2024-09-01",
      winner: "Charles Leclerc",
      winnerTeamId: "ferrari",
    });
  });

  it("reconnaît aussi un circuit renvoyé en tableau", async () => {
    stubFetch({ "/api/2024": { body: SAISON } });

    const race = await fetchCircuitRace("baku", "2024");
    expect(race?.round).toBe(17);
  });

  it("renvoie null si le circuit n'est pas au calendrier", async () => {
    stubFetch({ "/api/2024": { body: SAISON } });

    await expect(fetchCircuitRace("monaco", "2024")).resolves.toBeNull();
  });

  it("distingue « calendrier indisponible » de « circuit absent »", async () => {
    // Un hoquet de l'API faisait afficher « pas au calendrier » à tort —
    // observé sur Monza 2020, qui y était bien. `undefined` signale l'échec,
    // `null` l'absence réelle.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    stubFetch({ "/api/1800": { status: 500 } });

    await expect(fetchCircuitRace("monza", "1800")).resolves.toBeUndefined();
  });
});
