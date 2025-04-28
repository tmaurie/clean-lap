export async function fetchSeasonsDetails(): Promise<
  {
    season: string;
    raceCount: number;
    driverChampion?: {
      name: string;
      nationality: string;
    };
    constructorChampion?: string;
  }[]
> {
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/seasons.json?limit=100`,
  );
  const json = await res.json();
  const seasons = json?.MRData?.SeasonTable?.Seasons.reverse() ?? [];

  return await Promise.all(
    seasons.slice(0, 5).map(async (s: any) => {
      const raceRes = await fetch(
        `https://api.jolpi.ca/ergast/f1/${s.season}.json`,
      );
      const driverRes = await fetch(
        `https://api.jolpi.ca/ergast/f1/${s.season}/driverStandings.json`,
      );
      const json = await driverRes.json();
      const driverChampion =
        json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];

      const constructorRes = await fetch(
        `https://api.jolpi.ca/ergast/f1/${s.season}/constructorStandings.json`,
      );
      const raceJson = await raceRes.json();
      const count = raceJson.MRData.RaceTable?.Races?.length ?? 0;

      const constructorJson = await constructorRes.json();
      const constructorChampion =
        constructorJson?.MRData?.StandingsTable?.StandingsLists?.[0]
          ?.ConstructorStandings?.[0];

      return {
        season: s.season,
        raceCount: count,
        driverChampion: driverChampion
          ? {
              name: `${driverChampion.Driver.givenName} ${driverChampion.Driver.familyName}`,
              nationality: driverChampion.Driver.nationality,
            }
          : undefined,
        constructorChampion: constructorChampion?.Constructor?.name,
      };
    }),
  );
}

export async function fetchRacesWithWinner(season: string): Promise<
  {
    round: string;
    name: string;
    date: string;
    location: string;
    winner?: string;
  }[]
> {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/${season}.json`);
  const json = await res.json();
  const races = json.MRData.RaceTable?.Races ?? [];

  return await Promise.all(
    races.map(async (r: any) => {
      const winnerRes = await fetch(
        `https://api.jolpi.ca/ergast/f1/${season}/${r.round}/results.json`,
      );
      const winnerJson = await winnerRes.json();
      const result = winnerJson?.MRData?.RaceTable?.Races?.[0]?.Results?.[0];

      return {
        round: r.round,
        name: r.raceName,
        date: r.date,
        location: `${r.Circuit.Location.locality}, ${r.Circuit.Location.country}`,
        winner: result
          ? `${result.Driver.givenName} ${result.Driver.familyName}`
          : undefined,
      };
    }),
  );
}
