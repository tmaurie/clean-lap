import { afterEach, describe, expect, it, vi } from "vitest";

import freePracticeFixture from "@/docs/api/freepractice.json";
import qualyFixture from "@/docs/api/qualy_results.json";
import raceResultFixture from "@/docs/api/race_result.json";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

const { getCurrentWeekend } = await import("./getWeekend");

const SEASON_PAYLOAD = {
  season: 2026,
  races: [
    {
      raceName: "Grand Prix précédent 2026",
      round: 12,
      circuit: {
        circuitName: "Zandvoort",
        city: "Zandvoort",
        country: "Netherlands",
      },
      schedule: { race: { date: "2026-08-30", time: "13:00:00Z" } },
    },
    {
      raceName: "Gran Premio d'Italia 2026",
      round: 13,
      circuit: {
        circuitName: "Autodromo Nazionale Monza",
        city: "Monza",
        country: "Italy",
        circuitLength: "5793km",
        corners: 11,
      },
      schedule: {
        fp1: { date: "2026-09-04", time: "11:30:00Z" },
        fp2: { date: "2026-09-04", time: "15:00:00Z" },
        fp3: { date: "2026-09-05", time: "10:30:00Z" },
        qualy: { date: "2026-09-05", time: "14:00:00Z" },
        sprintQualy: { date: null, time: null },
        sprintRace: { date: null, time: null },
        race: { date: "2026-09-06", time: "13:00:00Z" },
      },
    },
  ],
};

/** URLs demandées pendant le dernier appel, pour vérifier ce qui est appelé. */
let requested: string[] = [];

function stubFetch(overrides: Record<string, number> = {}) {
  requested = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);

      const forcedStatus = Object.entries(overrides).find(([fragment]) =>
        url.includes(fragment),
      )?.[1];

      const respond = (body: unknown, status = 200) =>
        ({
          ok: status >= 200 && status < 300,
          status,
          statusText: String(status),
          json: async () => body,
        }) as Response;

      if (forcedStatus) return respond(null, forcedStatus);

      // Du plus spécifique au plus générique : "/race" matcherait "/sprint/race".
      if (/\/fp[123]$/.test(url)) return respond(freePracticeFixture);
      if (url.endsWith("/qualy")) return respond(qualyFixture);
      if (url.endsWith("/sprint/race")) return respond({ races: {} });
      if (url.endsWith("/race")) return respond(raceResultFixture);
      return respond(SEASON_PAYLOAD);
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// Samedi soir : essais et qualifs courus, course le lendemain.
const SATURDAY_EVENING = new Date("2026-09-05T20:00:00Z");

describe("getCurrentWeekend", () => {
  it("retient la manche en cours et son planning ordonné", async () => {
    stubFetch();

    const weekend = await getCurrentWeekend(SATURDAY_EVENING);

    expect(weekend?.round).toBe(13);
    expect(weekend?.season).toBe(2026);
    expect(weekend?.race.name).toBe("Gran Premio d'Italia 2026");
    expect(weekend?.sessions.map((s) => s.key)).toEqual([
      "fp1",
      "fp2",
      "fp3",
      "qualy",
      "race",
    ]);
  });

  it("interroge les résultats avec l'année, jamais avec l'alias 'current'", async () => {
    stubFetch();
    await getCurrentWeekend(SATURDAY_EVENING);

    const sessionCalls = requested.filter((url) =>
      /\/(fp[123]|qualy|race)$/.test(url),
    );

    expect(sessionCalls.length).toBeGreaterThan(0);
    // f1api.dev accepte /api/current, mais renvoie 404 sur
    // /api/current/13/qualy : seule l'année fonctionne sur les sous-ressources.
    for (const url of sessionCalls) {
      expect(url).toContain("/api/2026/13/");
      expect(url).not.toContain("/current/13/");
    }
  });

  it("charge un podium pour les sessions terminées", async () => {
    stubFetch();

    const weekend = await getCurrentWeekend(SATURDAY_EVENING);
    const qualy = weekend?.sessions.find((s) => s.key === "qualy");

    expect(qualy?.status).toBe("done");
    expect(qualy?.podium).toHaveLength(3);
    expect(qualy?.podium[0]).toMatchObject({
      position: "1",
      driver: "Max Verstappen",
      constructor: "Red Bull Racing",
    });
  });

  it("n'appelle rien pour les sessions à venir", async () => {
    stubFetch();

    const weekend = await getCurrentWeekend(SATURDAY_EVENING);
    const race = weekend?.sessions.find((s) => s.key === "race");

    expect(race?.status).toBe("upcoming");
    expect(race?.podium).toEqual([]);
    // Aucun appel payé pour une course qui n'a pas eu lieu.
    expect(requested.some((url) => url.endsWith("/2026/13/race"))).toBe(false);
  });

  it("reste affichable quand les résultats d'une session ne sont pas publiés", async () => {
    // Cas réel : le week-end est en cours, f1api.dev répond 404 sur la qualif.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    stubFetch({ "/qualy": 404 });

    const weekend = await getCurrentWeekend(SATURDAY_EVENING);
    const qualy = weekend?.sessions.find((s) => s.key === "qualy");

    expect(weekend).not.toBeNull();
    expect(qualy?.status).toBe("done");
    expect(qualy?.podium).toEqual([]);
  });

  it("renvoie null quand la saison est terminée", async () => {
    stubFetch();

    const weekend = await getCurrentWeekend(new Date("2026-12-31T00:00:00Z"));
    expect(weekend).toBeNull();
  });
});
