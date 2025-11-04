import { Season } from "@/entities/season/model";

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

const API_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const EARLIEST_SEASON = 1950;

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    cache: "force-cache",
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return (await response.json()) as T;
}

export async function fetchSeasonDetailsPage(
  page = 1,
  pageSize = 12,
  signal?: AbortSignal,
): Promise<Season[]> {
  const currentYear = new Date().getFullYear();
  const seasons: string[] = [];

  for (
    let year = currentYear - (page - 1) * pageSize;
    year >= EARLIEST_SEASON && seasons.length < pageSize;
    year--
  ) {
    seasons.push(year.toString());
  }

  if (seasons.length === 0) {
    return [];
  }

  return Promise.all(
    seasons.map(async (season) => {
      try {
        const [raceJson, driverJson, constructorJson] = await Promise.all([
          fetchJson<{ MRData: { RaceTable?: { Races?: Race[] } } }>(
            `${API_BASE_URL}/${season}.json?limit=100`,
            signal,
          ),
          fetchJson<{
            MRData: {
              StandingsTable?: {
                StandingsLists?: Array<{
                  DriverStandings?: Array<{
                    Driver: { givenName: string; familyName: string; nationality: string };
                  }>;
                }>;
              };
            };
          }>(
            `${API_BASE_URL}/${season}/driverStandings.json?limit=1`,
            signal,
          ),
          fetchJson<{
            MRData: {
              StandingsTable?: {
                StandingsLists?: Array<{
                  ConstructorStandings?: Array<{
                    Constructor?: { name: string };
                  }>;
                }>;
              };
            };
          }>(
            `${API_BASE_URL}/${season}/constructorStandings.json?limit=1`,
            signal,
          ),
        ]);

        const raceCount = raceJson.MRData.RaceTable?.Races?.length ?? 0;
        const driverChampion =
          driverJson.MRData.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
        const constructorChampion =
          constructorJson.MRData.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0];

        return {
          season,
          raceCount,
          driverChampion: driverChampion
            ? {
                name: `${driverChampion.Driver.givenName} ${driverChampion.Driver.familyName}`,
                nationality: driverChampion.Driver.nationality,
              }
            : undefined,
          constructorChampion: constructorChampion?.Constructor?.name,
        } satisfies Season;
      } catch {
        return {
          season,
          raceCount: 0,
          driverChampion: undefined,
          constructorChampion: undefined,
        } satisfies Season;
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
