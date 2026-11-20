import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  classification,
  grandPrix,
  raceTable,
  stubProvider,
} from "@/lib/api/test-support";
import { getCurrentWeekend } from "./getWeekend";

vi.mock("@/lib/api/client", () => ({ requestData: vi.fn() }));

const round = {
  ...grandPrix,
  season: "2026",
  round: "2",
  date: "2026-03-15",
  time: "07:00:00Z",
  raceName: "Chinese Grand Prix",
  Circuit: {
    circuitId: "shanghai",
    circuitName: "Shanghai International Circuit",
    Location: { locality: "Shanghai", country: "China" },
  },
  FirstPractice: { date: "2026-03-13", time: "03:30:00Z" },
  SprintQualifying: { date: "2026-03-13", time: "07:30:00Z" },
  Sprint: { date: "2026-03-14", time: "03:00:00Z" },
  Qualifying: { date: "2026-03-14", time: "07:00:00Z" },
};

const routes = {
  "2026": raceTable([round]),
  "2026/2/sprint": raceTable([
    { ...round, SprintResults: [{ ...classification, points: "8" }] },
  ]),
  "2026/2/qualifying": raceTable([]),
  "sessions?year=2026": [],
};

beforeEach(() => {
  vi.spyOn(Date.prototype, "getFullYear").mockReturnValue(2026);
});

afterEach(() => vi.restoreAllMocks());

describe("getCurrentWeekend", () => {
  it("charge les résultats terminés et conserve l'ordre des sessions sprint", async () => {
    const provider = stubProvider(routes);
    const weekend = await getCurrentWeekend(new Date("2026-03-14T09:30:00Z"));

    expect(weekend).toMatchObject({ season: 2026, round: 2, total: 1 });
    expect(weekend?.sessions.map(({ key, status }) => [key, status])).toEqual([
      ["fp1", "done"],
      ["sprintQualy", "done"],
      ["sprintRace", "done"],
      ["qualy", "done"],
      ["race", "upcoming"],
    ]);
    expect(
      weekend?.sessions.find((session) => session.key === "sprintRace")?.podium,
    ).toMatchObject([{ driver: "Max Verstappen", detail: "8 pts" }]);
    expect(
      weekend?.sessions.find((session) => session.key === "qualy")?.podium,
    ).toEqual([]);
    expect(provider).not.toHaveBeenCalledWith(
      "jolpica",
      "2026/2/results/?limit=100&offset=0",
      "2026",
    );
  });

  it("ne charge aucune séance avant le début du week-end", async () => {
    const provider = stubProvider(routes);
    const weekend = await getCurrentWeekend(new Date("2026-03-12T07:00:00Z"));
    expect(
      weekend?.sessions.every(
        ({ podium, status }) => podium.length === 0 && status === "upcoming",
      ),
    ).toBe(true);
    expect(
      provider.mock.calls.every(([, endpoint]) =>
        endpoint.startsWith("2026/?"),
      ),
    ).toBe(true);
  });

  it("renvoie null quand la saison est terminée", async () => {
    stubProvider(routes);
    await expect(
      getCurrentWeekend(new Date("2026-12-30T00:00:00Z")),
    ).resolves.toBeNull();
  });
});
