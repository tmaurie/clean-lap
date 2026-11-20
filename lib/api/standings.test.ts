import { expect, it, vi } from "vitest";
import { fetchConstructorStandings, fetchDriverStandings } from "./standings";
import { constructor, envelope, stubProvider, zhou } from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

it("mappe les points fractionnaires et conserve l'identifiant de favori", async () => {
  stubProvider({
    "2021/driverstandings": envelope("StandingsTable", "StandingsLists", [
      {
        DriverStandings: [
          {
            position: "1",
            points: "395.5",
            wins: "10",
            Driver: zhou,
            Constructors: [constructor],
          },
        ],
      },
    ]),
    "2021/constructorstandings": envelope("StandingsTable", "StandingsLists", [
      {
        ConstructorStandings: [
          {
            position: "1",
            points: "492.5",
            wins: "11",
            Constructor: constructor,
          },
        ],
      },
    ]),
  });

  await expect(fetchDriverStandings("2021")).resolves.toMatchObject([
    {
      driverId: "guanyu",
      constructorId: "red_bull",
      points: "395.5",
      wins: 10,
    },
  ]);
  await expect(fetchConstructorStandings("2021")).resolves.toMatchObject([
    {
      constructorId: "red_bull",
      points: "492.5",
      wins: 11,
      nationality: "Austrian",
    },
  ]);
});

it("accepte une saison sans championnat constructeurs et propage les pannes", async () => {
  const fetch = stubProvider({ "2025/driverstandings": new Error("HTTP 503") });
  await expect(fetchConstructorStandings("1950")).resolves.toEqual([]);
  expect(fetch).not.toHaveBeenCalled();
  await expect(fetchDriverStandings("2025")).rejects.toThrow("503");
});
