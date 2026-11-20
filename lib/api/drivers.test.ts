import { describe, expect, it, vi } from "vitest";
import { fetchDriverSeason, fetchDrivers } from "./drivers";
import {
  classification,
  envelope,
  grandPrix,
  raceTable,
  stubProvider,
  verstappen,
  zhou,
} from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

describe("pilotes Jolpica", () => {
  it("pagine le répertoire et filtre par nom, identifiant et trigramme", async () => {
    const fetch = stubProvider({
      drivers: envelope("DriverTable", "Drivers", [verstappen], {
        limit: 100,
        total: 101,
      }),
      "drivers/?limit=100&offset=100": envelope(
        "DriverTable",
        "Drivers",
        [zhou],
        { offset: 100, total: 101 },
      ),
    });

    await expect(fetchDrivers()).resolves.toMatchObject([
      { id: "max_verstappen", name: "Max", surname: "Verstappen", number: 33 },
      { id: "guanyu", shortName: "ZHO" },
    ]);
    expect(fetch).toHaveBeenCalledWith(
      "jolpica",
      "drivers/?limit=100&offset=100",
      undefined,
    );
    for (const query of ["  ZHO ", "GUANYU", "Zhou"]) {
      await expect(fetchDrivers({ search: query })).resolves.toMatchObject([
        { id: "guanyu" },
      ]);
    }
  });

  it("relie les manches et inclut les points d'un sprint sans résultat en course", async () => {
    stubProvider({
      "2025/drivers/max_verstappen/results": raceTable([
        { ...grandPrix, Results: [classification] },
        {
          ...grandPrix,
          round: "17",
          Results: [
            {
              ...classification,
              positionText: "R",
              status: "Retired",
              grid: "0",
              points: "0",
            },
          ],
        },
      ]),
      "2025/drivers/max_verstappen/sprint": raceTable([
        { ...grandPrix, SprintResults: [{ ...classification, points: "8" }] },
        {
          ...grandPrix,
          round: "18",
          SprintResults: [{ ...classification, points: "6" }],
        },
      ]),
    });
    const result = await fetchDriverSeason("max_verstappen", "2025");
    expect(result?.driver.teamId).toBe("red_bull");
    expect(result?.stats).toEqual({
      wins: 1,
      podiums: 1,
      points: 39,
      avgGrid: 2,
    });
    expect(result?.races).toMatchObject([
      { round: 16, date: "2025-09-07", points: 33, location: "Monza, Italy" },
      { round: 17, position: "R", grid: null },
      { round: 18, position: null, sprintPoints: 6, points: 6 },
    ]);
  });

  it("accepte l'ancien lien de Zhou même pour une saison sans course", async () => {
    stubProvider({
      "2025/drivers/zhou/results": raceTable([]),
      "2025/drivers/zhou/sprint": raceTable([]),
      "drivers/zhou": envelope("DriverTable", "Drivers", [zhou]),
    });
    await expect(fetchDriverSeason("guanyu", "2025")).resolves.toMatchObject({
      driver: { id: "guanyu", surname: "Zhou" },
      races: [],
    });
  });

  it("réserve le résultat null au pilote inconnu", async () => {
    stubProvider({
      "1950/drivers/inconnu/results": raceTable([]),
      "drivers/inconnu": envelope("DriverTable", "Drivers", []),
      "1950/drivers/farina/results": new Error("HTTP 429"),
    });
    await expect(fetchDriverSeason("inconnu", "1950")).resolves.toBeNull();
    await expect(fetchDriverSeason("farina", "1950")).rejects.toThrow("429");
  });
});
