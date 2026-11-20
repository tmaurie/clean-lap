import { describe, expect, it, vi } from "vitest";

import {
  fetchQualifyingResults,
  fetchRaceResults,
  fetchRaceSchedule,
  fetchRaces,
  fetchSprintResults,
} from "./race";
import {
  classification,
  grandPrix,
  raceTable,
  stubProvider,
  zhou,
} from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

describe("Jolpica race data", () => {
  it("conserve les numéros de manche, l'heure UTC et les créneaux sprint", async () => {
    const sprint = {
      ...grandPrix,
      Sprint: { date: "2025-09-06", time: "10:00:00Z" },
      SprintQualifying: { date: "2025-09-05", time: "14:00:00Z" },
    };
    stubProvider({
      "2025": raceTable([
        sprint,
        { ...grandPrix, round: "18", time: undefined },
      ]),
    });

    await expect(fetchRaces("2025")).resolves.toMatchObject([
      { round: 16, location: "Monza, Italy", time: "13:00:00Z" },
      { round: 18, time: null },
    ]);
    await expect(fetchRaceSchedule("2025", "16")).resolves.toMatchObject({
      season: 2025,
      schedule: {
        sprintQualy: { date: "2025-09-05", time: "14:00:00Z" },
        sprintRace: { date: "2025-09-06", time: "10:00:00Z" },
        fp2: { date: null, time: null },
      },
    });
  });

  it("distingue le résultat en attente, la manche inconnue et la panne du fournisseur", async () => {
    stubProvider({
      "2025": raceTable([grandPrix, { ...grandPrix, round: "17" }]),
      "2025/16/results": raceTable([]),
      "2025/98/results": raceTable([]),
      "2025/17/results": new Error("HTTP 503"),
    });
    await expect(fetchRaceResults("2025", "16")).resolves.toMatchObject({
      raceName: "Italian Grand Prix",
      results: [],
    });
    await expect(fetchRaceResults("2025", "98")).resolves.toBeNull();
    await expect(fetchRaceResults("2025", "17")).rejects.toThrow("503");
  });

  it("rend le classement, le vrai tour le plus rapide et les statuts", async () => {
    stubProvider({
      "2025/last/results": raceTable([
        {
          ...grandPrix,
          Results: [
            {
              ...classification,
              Time: { time: "1:24:12.000" },
              FastestLap: { rank: "2", lap: "44", Time: { time: "1:20.001" } },
            },
            {
              ...classification,
              Driver: zhou,
              positionText: "R",
              status: "Retired",
            },
          ],
        },
      ]),
    });
    await expect(fetchRaceResults("2025", "last")).resolves.toMatchObject({
      results: [
        {
          position: "1",
          driver: "Max Verstappen",
          time: "1:24:12.000",
          fastestLap: { rank: "1", lap: "44", time: "1:20.001" },
        },
        { position: "R", time: "Retired", fastestLap: undefined },
      ],
    });
  });

  it("distingue la place en qualifications de la position sur la grille", async () => {
    stubProvider({
      "2025/16/qualifying": raceTable([
        {
          ...grandPrix,
          QualifyingResults: [
            {
              ...classification,
              Q1: "1:20.405",
              Q2: "1:19.311",
              Q3: "1:19.011",
            },
            { ...classification, Driver: zhou, position: "2", Q1: "1:20.401" },
          ],
        },
      ]),
    });
    await expect(fetchQualifyingResults("2025", "16")).resolves.toMatchObject({
      results: [
        {
          position: "1",
          isFastestQ1: false,
          isFastestQ2: true,
          isFastestQ3: true,
        },
        {
          position: "2",
          isFastestQ1: true,
          isFastestQ2: false,
          isFastestQ3: false,
        },
      ],
    });
  });

  it("reprend les tours du sprint et accepte une séance sans résultat", async () => {
    stubProvider({
      "2025/16/sprint": raceTable([
        {
          ...grandPrix,
          SprintResults: [{ ...classification, laps: "19", points: "8" }],
        },
      ]),
      "2025/17/sprint": raceTable([]),
      "2025/17/qualifying": raceTable([]),
    });
    await expect(fetchSprintResults("2025", "16")).resolves.toMatchObject({
      results: [{ points: "8", laps: "19", grid: "2" }],
    });
    await expect(fetchSprintResults("2025", "17")).resolves.toEqual({
      results: [],
    });
    await expect(fetchQualifyingResults("2025", "17")).resolves.toEqual({
      results: [],
    });
  });
});
