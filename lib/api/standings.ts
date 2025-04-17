import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";

export async function fetchDriverStandings(): Promise<DriverStanding[]> {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/driverStandings.json",
  );
  const json = await res.json();
  const standings =
    json.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  return standings.map(
    (s: any): DriverStanding => ({
      position: s.position,
      points: s.points,
      driver: `${s.Driver.givenName} ${s.Driver.familyName}`,
      constructor: s.Constructors[0].name,
    }),
  );
}

export async function fetchConstructorStandings(): Promise<
  ConstructorStanding[]
> {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/current/constructorStandings.json",
  );
  const json = await res.json();
  const standings =
    json.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];

  return standings.map(
    (s: any): ConstructorStanding => ({
      position: s.position,
      points: s.points,
      constructor: s.Constructor.name,
    }),
  );
}
