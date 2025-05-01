import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`,
  );
  const json = await res.json();
  const standings =
    json.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  return standings.map((s: any) => ({
    position: s.position,
    wins: s.wins,
    points: s.points,
    driver: `${s.Driver.givenName} ${s.Driver.familyName}`,
    constructor: s.Constructors[0].name,
    nationality: s.Driver.nationality,
  }));
}

export async function fetchConstructorStandings(
  season: string,
): Promise<ConstructorStanding[]> {
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/${season}/constructorStandings.json`,
  );
  const json = await res.json();
  const standings =
    json.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];

  return standings.map((s: any) => ({
    position: s.position,
    points: s.points,
    wins: s.wins,
    constructor: s.Constructor.name,
    nationality: s.Constructor.nationality,
  }));
}
