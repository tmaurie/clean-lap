type Race = {
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    Location: {
      locality: string;
      country: string;
    };
  };
};

export async function fetchSeasonDetails(): Promise<
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
  const seasons = Array.from(
    { length: new Date().getFullYear() - 1950 + 1 },
    (_, i) => (new Date().getFullYear() - i).toString(),
  ).map((year) => ({
    season: year,
  }));

  return await Promise.all(
    seasons.map(async (s: any) => {
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

  return Promise.all(
    races.map(async (race: Race) => {
      const winnerRes = await fetch(
        `https://api.jolpi.ca/ergast/f1/${season}/${race.round}/results.json`,
      );
      const winnerJson = await winnerRes.json();
      const winner =
        winnerJson.MRData.RaceTable?.Races[0]?.Results[0]?.Driver?.familyName;
      return {
        round: race.round,
        name: race.raceName,
        date: race.date,
        location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
        winner: winner,
      };
    }),
  );
}
