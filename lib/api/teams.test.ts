import { expect, it, vi } from "vitest";
import { fetchTeam, fetchTeamSeason } from "./teams";
import {
  constructor,
  envelope,
  stubProvider,
  verstappen,
  zhou,
} from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

it("enrichit le palmarès et trie les remplaçants après les classés", async () => {
  stubProvider({
    "constructors/red_bull": envelope("ConstructorTable", "Constructors", [
      constructor,
    ]),
    "2025/constructors/red_bull/drivers": envelope("DriverTable", "Drivers", [
      zhou,
      verstappen,
    ]),
    "2025/driverstandings": envelope("StandingsTable", "StandingsLists", [
      {
        DriverStandings: [
          {
            position: "2",
            points: "421",
            wins: "8",
            Driver: verstappen,
            Constructors: [constructor],
          },
        ],
      },
    ]),
    "2025/constructorstandings": envelope("StandingsTable", "StandingsLists", [
      {
        ConstructorStandings: [
          { position: "3", points: "451", wins: "8", Constructor: constructor },
        ],
      },
    ]),
  });

  await expect(fetchTeamSeason("red_bull", "2025")).resolves.toMatchObject({
    team: { firstSeason: 2005, constructorsTitles: 6, driversTitles: 8 },
    standing: { position: 3, points: 451, wins: 8 },
    lineup: [
      { id: "max_verstappen", position: 2 },
      { id: "guanyu", position: null },
    ],
  });
});

it("laisse les statistiques non vérifiées à null", async () => {
  stubProvider({
    "constructors/exemple": envelope("ConstructorTable", "Constructors", [
      { constructorId: "exemple", name: "Exemple" },
    ]),
  });
  await expect(fetchTeam("exemple")).resolves.toMatchObject({
    firstSeason: null,
    constructorsTitles: null,
    driversTitles: null,
  });
});

it("renvoie null si le constructeur n'existe pas", async () => {
  stubProvider({
    "constructors/inconnu": envelope("ConstructorTable", "Constructors", []),
  });
  await expect(fetchTeamSeason("inconnu", "2025")).resolves.toBeNull();
});
