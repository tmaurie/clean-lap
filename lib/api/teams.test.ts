import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchTeam, fetchTeamSeason } from "./teams";

/** `/api/teams/{id}` renvoie `team` en tableau — piège propre à cet endpoint. */
const TEAM_PROFILE = {
  team: [
    {
      teamId: "ferrari",
      teamName: "Scuderia Ferrari",
      teamNationality: "Italy",
      firstAppeareance: 1950,
      constructorsChampionships: 16,
      driversChampionships: 15,
      url: "https://en.wikipedia.org/wiki/Scuderia_Ferrari",
    },
  ],
};

const TEAM_SEASON = {
  season: 2024,
  teamId: "ferrari",
  team: {
    teamId: "ferrari",
    teamName: "Scuderia Ferrari",
    teamNationality: "Italy",
    firstAppeareance: 1950,
    constructorsChampionships: 16,
    driversChampionships: 15,
    points: 652,
    position: 2,
    wins: 5,
  },
  drivers: [
    {
      driver: {
        driverId: "leclerc",
        name: "Charles",
        surname: "Leclerc",
        nationality: "Monaco",
        number: 16,
        shortName: "LEC",
        points: 356,
        position: 3,
        wins: 3,
      },
    },
    {
      driver: {
        driverId: "bearman",
        name: "Oliver",
        surname: "Bearman",
        nationality: "Great Britain",
        number: 87,
        shortName: "BEA",
        points: 7,
        position: 18,
        wins: null,
      },
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
      const match = Object.keys(routes).find((fragment) =>
        url.includes(fragment),
      );
      if (!match) throw new Error(`Aucune route de test pour ${url}`);

      const { status = 200, body } = routes[match];
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
  vi.restoreAllMocks();
});

describe("fetchTeam", () => {
  it("déballe la réponse quand `team` arrive en tableau", async () => {
    stubFetch({ "/teams/ferrari": { body: TEAM_PROFILE } });

    await expect(fetchTeam("ferrari")).resolves.toEqual({
      id: "ferrari",
      name: "Scuderia Ferrari",
      nationality: "Italy",
      firstSeason: 1950,
      constructorsTitles: 16,
      driversTitles: 15,
      url: "https://en.wikipedia.org/wiki/Scuderia_Ferrari",
    });
  });

  it("accepte aussi la forme objet", async () => {
    stubFetch({ "/teams/ferrari": { body: { team: TEAM_PROFILE.team[0] } } });

    const team = await fetchTeam("ferrari");
    expect(team?.name).toBe("Scuderia Ferrari");
  });

  it("lit les trois orthographes de la première saison", async () => {
    // f1api.dev écrit ce champ de trois façons selon l'endpoint.
    for (const key of [
      "firstAppeareance",
      "firstAppareance",
      "firstAppearance",
    ]) {
      stubFetch({
        "/teams/x": { body: { team: [{ teamId: "x", [key]: 1977 }] } },
      });
      const team = await fetchTeam("x");
      expect(team?.firstSeason, `orthographe ${key}`).toBe(1977);
    }
  });

  it("renvoie null sur une écurie inexistante", async () => {
    stubFetch({ "/teams/": { status: 404 } });

    await expect(fetchTeam("inconnue")).resolves.toBeNull();
  });
});

describe("fetchTeamSeason", () => {
  it("assemble palmarès, classement et effectif", async () => {
    stubFetch({
      "/teams/ferrari/drivers": { body: TEAM_SEASON },
      "/teams/ferrari": { body: TEAM_PROFILE },
    });

    const season = await fetchTeamSeason("ferrari", "2024");

    expect(season?.team.constructorsTitles).toBe(16);
    expect(season?.standing).toEqual({ position: 2, points: 652, wins: 5 });
    expect(season?.lineup).toHaveLength(2);
    // Trié par classement : Leclerc (P3) avant Bearman (P18), alors que
    // l'API renvoie le remplaçant en premier.
    expect(season?.lineup.map((d) => d.id)).toEqual(["leclerc", "bearman"]);
    expect(season?.lineup[0]).toMatchObject({
      id: "leclerc",
      surname: "Leclerc",
      points: 356,
      wins: 3,
    });
  });

  it("inclut les remplaçants de la saison", async () => {
    stubFetch({
      "/teams/ferrari/drivers": { body: TEAM_SEASON },
      "/teams/ferrari": { body: TEAM_PROFILE },
    });

    const season = await fetchTeamSeason("ferrari", "2024");
    // Bearman a remplacé Sainz sur une manche : l'effectif n'est pas figé à 2.
    expect(season?.lineup.map((d) => d.id)).toContain("bearman");
    expect(season?.lineup.at(-1)?.wins).toBeNull();
  });

  it("place en dernier un pilote sans classement", async () => {
    stubFetch({
      "/teams/x/drivers": {
        body: {
          team: { teamId: "x", position: 1 },
          drivers: [
            { driver: { driverId: "sans-position", name: "A", surname: "A" } },
            {
              driver: {
                driverId: "titulaire",
                name: "B",
                surname: "B",
                position: 4,
              },
            },
          ],
        },
      },
      "/teams/x": { body: { team: [{ teamId: "x", teamName: "X" }] } },
    });

    const season = await fetchTeamSeason("x", "2024");
    expect(season?.lineup.map((d) => d.id)).toEqual([
      "titulaire",
      "sans-position",
    ]);
  });

  it("ne fabrique pas de classement quand l'API n'en donne aucun", async () => {
    stubFetch({
      "/teams/ferrari/drivers": {
        body: { team: { teamId: "ferrari", teamName: "Scuderia Ferrari" } },
      },
      "/teams/ferrari": { body: TEAM_PROFILE },
    });

    const season = await fetchTeamSeason("ferrari", "1950");
    expect(season?.standing).toBeNull();
  });

  it("renvoie null quand l'écurie n'existe pas du tout", async () => {
    stubFetch({ "/teams/": { status: 404 } });

    await expect(fetchTeamSeason("inconnue", "2024")).resolves.toBeNull();
  });

  it("reste affichable si la saison n'a pas de données", async () => {
    stubFetch({
      "/teams/ferrari/drivers": { status: 404 },
      "/teams/ferrari": { body: TEAM_PROFILE },
    });

    const season = await fetchTeamSeason("ferrari", "1980");
    expect(season?.team.name).toBe("Scuderia Ferrari");
    expect(season?.lineup).toEqual([]);
    expect(season?.standing).toBeNull();
  });
});
