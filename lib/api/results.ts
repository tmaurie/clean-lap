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

export async function fetchSeasonDetailsPage(page = 1, pageSize = 10) {
  const currentYear = new Date().getFullYear();
  const start = currentYear - (page - 1) * pageSize;
  const end = start - pageSize + 1;

  const seasons = Array.from({ length: pageSize }, (_, i) =>
    (start - i).toString(),
  );

  return await Promise.all(
    seasons.map(async (season) => {
      try {
        const [raceRes, driverRes, constructorRes] = await Promise.all([
          fetch(`https://api.jolpi.ca/ergast/f1/${season}.json`),
          fetch(
            `https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`,
          ),
          fetch(
            `https://api.jolpi.ca/ergast/f1/${season}/constructorStandings.json`,
          ),
        ]);

        const raceJson = await raceRes.json();
        const driverJson = await driverRes.json();
        const constructorJson = await constructorRes.json();

        const count = raceJson.MRData.RaceTable?.Races?.length ?? 0;
        const driverChampion =
          driverJson?.MRData?.StandingsTable?.StandingsLists?.[0]
            ?.DriverStandings?.[0];
        const constructorChampion =
          constructorJson?.MRData?.StandingsTable?.StandingsLists?.[0]
            ?.ConstructorStandings?.[0];

        return {
          season,
          raceCount: count,
          driverChampion: driverChampion
            ? {
                name: `${driverChampion.Driver.givenName} ${driverChampion.Driver.familyName}`,
                nationality: driverChampion.Driver.nationality,
              }
            : undefined,
          constructorChampion: constructorChampion?.Constructor?.name,
        };
      } catch {
        return {
          season,
          raceCount: 0,
          driverChampion: undefined,
          constructorChampion: undefined,
        };
      }
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
