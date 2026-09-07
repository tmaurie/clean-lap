import { describe, expect, it } from "vitest";

import { DriverRaceResult, DriverSeason } from "@/entities/driver/model";

import { compareDrivers } from "./compareDrivers";

const race = (
  round: number,
  position: DriverRaceResult["position"],
  grid: DriverRaceResult["grid"],
  points = 0,
  status: string | null = null,
): DriverRaceResult => ({
  round,
  raceName: `GP ${round}`,
  date: `2024-03-0${round}`,
  grid,
  position,
  sprintPosition: null,
  sprintPoints: 0,
  points,
  status,
  location: "Ville, Pays",
});

const season = (
  id: string,
  races: DriverRaceResult[],
  stats: DriverSeason["stats"],
): DriverSeason => ({
  season: "2024",
  driver: { id, name: id, surname: id },
  races,
  stats,
});

const VER = season(
  "max_verstappen",
  [
    race(1, 1, 1, 25),
    race(2, 2, 1, 18),
    race(3, "NC", 3, 0, "Brakes"),
    race(4, 1, 2, 25),
  ],
  { wins: 2, podiums: 3, points: 68, avgGrid: 1.8 },
);

const LEC = season(
  "leclerc",
  [
    race(1, 3, 2, 15),
    race(2, 1, 2, 25),
    race(3, 2, 1, 18),
    // Manche 5 : absente chez Verstappen, elle ne doit départager personne.
    race(5, 1, 1, 25),
  ],
  { wins: 2, podiums: 4, points: 83, avgGrid: 1.5 },
);

describe("compareDrivers", () => {
  const comparison = compareDrivers("2024", VER, LEC);

  it("ne compte le duel que sur les manches courues par les deux", () => {
    // Manches communes exploitables : 1 et 2 (la 3 a un « NC », la 5 manque).
    expect(comparison.race).toEqual({ a: 1, b: 1, rounds: 2 });
  });

  it("compte le duel en qualification sur les grilles exploitables", () => {
    // Grilles communes : R1 (1 vs 2) et R2 (1 vs 2) pour VER, R3 (3 vs 1)
    // pour LEC.
    expect(comparison.qualifying).toEqual({ a: 2, b: 1, rounds: 3 });
  });

  it("désigne un vainqueur par métrique", () => {
    const byKey = Object.fromEntries(comparison.metrics.map((m) => [m.key, m]));

    expect(byKey.points).toMatchObject({ a: 68, b: 83, winner: "b" });
    expect(byKey.wins).toMatchObject({ a: 2, b: 2, winner: null });
    // Deux poles chacun (VER en R1 et R2, LEC en R3 et R5) : égalité.
    expect(byKey.poles).toMatchObject({ a: 2, b: 2, winner: null });
  });

  it("inverse la comparaison là où le plus petit est meilleur", () => {
    const byKey = Object.fromEntries(comparison.metrics.map((m) => [m.key, m]));

    // Grille moyenne : 1,5 vaut mieux que 1,8.
    expect(byKey.avgGrid).toMatchObject({ a: 1.8, b: 1.5, winner: "b" });
    // Abandons : VER en a un, LEC aucun.
    expect(byKey.dnfs).toMatchObject({ a: 1, b: 0, winner: "b" });
  });

  it("ne classe pas une position non exploitable comme un résultat", () => {
    const byKey = Object.fromEntries(comparison.metrics.map((m) => [m.key, m]));

    // « NC » ne doit pas devenir un podium ni un meilleur résultat.
    expect(byKey.podiums.a).toBe(3);
    expect(byKey.bestFinish).toMatchObject({ a: 1, b: 1, winner: null });
  });

  it("compte un abandon même sans motif, si la position est inexploitable", () => {
    const abandon = season("x", [race(1, "NC", 5), race(2, 4, 4, 12)], {
      wins: 0,
      podiums: 0,
      points: 12,
      avgGrid: 4.5,
    });
    const propre = season("y", [race(1, 5, 5, 10), race(2, 3, 3, 15)], {
      wins: 0,
      podiums: 1,
      points: 25,
      avgGrid: 4,
    });

    const c = compareDrivers("2024", abandon, propre);
    const dnfs = c.metrics.find((m) => m.key === "dnfs");
    expect(dnfs).toMatchObject({ a: 1, b: 0, winner: "b" });
  });

  it("supporte une saison vide", () => {
    const vide = season("z", [], {
      wins: 0,
      podiums: 0,
      points: 0,
      avgGrid: null,
    });

    const c = compareDrivers("2024", vide, vide);
    expect(c.race).toEqual({ a: 0, b: 0, rounds: 0 });
    expect(c.metrics.find((m) => m.key === "bestFinish")).toMatchObject({
      a: null,
      b: null,
      winner: null,
    });
  });
});
