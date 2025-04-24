export async function fetchSeasonsWithRaceCount(): Promise<
  { season: string; raceCount: number }[]
> {
  const res = await fetch(
    "https://api.jolpi.ca/ergast/f1/seasons.json?limit=100",
  );
  const json = await res.json();
  const seasons = json?.MRData?.SeasonTable?.Seasons ?? [];

  return await Promise.all(
    seasons.reverse().map(async (s: any) => {
      const r = await fetch(`https://api.jolpi.ca/ergast/f1/${s.season}.json`);
      const data = await r.json();
      const count = data.MRData.RaceTable?.Races?.length ?? 0;
      return {
        season: s.season,
        raceCount: count,
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
