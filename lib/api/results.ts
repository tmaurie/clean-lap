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

async function fetchJsonSafe<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T | null> {
  try {
    return await fetchJson<T>(url, signal);
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error(`[fetchJsonSafe] Failed to fetch ${url}`, error);
    return null;
  }
}

type DriverStandingsResponse = {
  MRData: {
    StandingsTable?: {
      StandingsLists?: Array<{
        DriverStandings?: Array<{
          Driver: {
            givenName: string;
            familyName: string;
            nationality: string;
          };
        }>;
      }>;
    };
  };
};

type ConstructorStandingsResponse = {
  MRData: {
    StandingsTable?: {
      StandingsLists?: Array<{
        ConstructorStandings?: Array<{
          Constructor?: { name: string };
        }>;
      }>;
    };
  };
};

async function fetchSeasonSnapshot(
  season: string,
  signal?: AbortSignal,
): Promise<Season> {
  const raceJson = await fetchJsonSafe<{
    MRData: { RaceTable?: { Races?: Race[] } };
  }>(`${API_BASE_URL}/${season}.json?limit=200`, signal);

  const [driverJson, constructorJson] = await Promise.all([
    fetchJsonSafe<DriverStandingsResponse>(
      `${API_BASE_URL}/${season}/driverStandings.json?limit=1`,
      signal,
    ),
    fetchJsonSafe<ConstructorStandingsResponse>(
      `${API_BASE_URL}/${season}/constructorStandings.json?limit=1`,
      signal,
    ),
  ]);

  const raceCount = raceJson?.MRData.RaceTable?.Races?.length ?? 0;
  const driverChampion =
    driverJson?.MRData.StandingsTable?.StandingsLists?.[0]
      ?.DriverStandings?.[0];
  const constructorChampion =
    constructorJson?.MRData.StandingsTable?.StandingsLists?.[0]
      ?.ConstructorStandings?.[0];

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

  const result: Season[] = [];

  for (const season of seasons) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    result.push(await fetchSeasonSnapshot(season, signal));
  }

  return result;
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
  const racesJson = await fetchJson<{
    MRData: { RaceTable?: { Races?: Race[] } };
  }>(`${API_BASE_URL}/${season}.json?limit=200`);
  const winnersJson = await fetchJson<{
    MRData: {
      RaceTable?: {
        Races?: Array<
          Race & {
            Results?: Array<{
              Driver?: { givenName: string; familyName: string };
            }>;
          }
        >;
      };
    };
  }>(`${API_BASE_URL}/${season}/results/1.json?limit=200`);

  const winnersByRound = new Map(
    (winnersJson.MRData.RaceTable?.Races ?? []).map((race) => [
      race.round,
      race.Results?.[0]?.Driver
        ? `${race.Results[0].Driver.givenName} ${race.Results[0].Driver.familyName}`
        : undefined,
    ]),
  );

  return (racesJson.MRData.RaceTable?.Races ?? []).map((race) => ({
    round: race.round,
    name: race.raceName,
    date: race.date,
    location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
    winner: winnersByRound.get(race.round),
  }));
}
