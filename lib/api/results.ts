import { Season } from "@/entities/season/model";
import { API_ROUTES } from "@/lib/config/api";

const EARLIEST_SEASON = 1950;

type RaceSchedule = {
  race?: { date?: string; time?: string };
};

type RaceCircuit = {
  circuitName?: string;
  country?: string;
  city?: string;
  Location?: { locality?: string; country?: string };
};

type RaceWinner = {
  name?: string;
  surname?: string;
} | null;

type Race = {
  round?: number | string;
  raceName?: string;
  schedule?: RaceSchedule;
  date?: string;
  circuit?: RaceCircuit;
  Circuit?: RaceCircuit;
  winner?: RaceWinner;
};

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
  drivers_championship?: Array<{
    driver?: { name?: string; surname?: string; nationality?: string };
  }>;
};

type ConstructorStandingsResponse = {
  constructors_championship?: Array<{
    team?: { teamName?: string };
  }>;
};

function formatLocation(race: Race): string {
  const city = race.circuit?.city ?? race.Circuit?.Location?.locality ?? "";
  const country =
    race.circuit?.country ?? race.Circuit?.Location?.country ?? "";

  if (city && country) {
    return `${city}, ${country}`;
  }

  return city || country || "";
}

function formatWinner(winner: RaceWinner): string | undefined {
  if (!winner) {
    return undefined;
  }

  const name = [winner.name, winner.surname].filter(Boolean).join(" ");
  return name || undefined;
}

async function fetchSeasonSnapshot(
  season: string,
  signal?: AbortSignal,
): Promise<Season> {
  const raceJson = await fetchJsonSafe<{ races?: Race[] }>(
    API_ROUTES.races(season, { limit: 200 }),
    signal,
  );

  const [driverJson, constructorJson] = await Promise.all([
    fetchJsonSafe<DriverStandingsResponse>(
      API_ROUTES.driverStandings(season),
      signal,
    ),
    fetchJsonSafe<ConstructorStandingsResponse>(
      API_ROUTES.constructorStandings(season),
      signal,
    ),
  ]);

  const raceCount = raceJson?.races?.length ?? 0;
  const driverChampion = driverJson?.drivers_championship?.[0];
  const constructorChampion = constructorJson?.constructors_championship?.[0];

  const driverName = [
    driverChampion?.driver?.name,
    driverChampion?.driver?.surname,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    season,
    raceCount,
    driverChampion:
      driverName && driverChampion?.driver?.nationality
        ? {
            name: driverName,
            nationality: driverChampion.driver.nationality,
          }
        : undefined,
    constructorChampion: constructorChampion?.team?.teamName ?? undefined,
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
  const racesJson = await fetchJson<{ races?: Race[] }>(
    API_ROUTES.races(season, { limit: 200 }),
  );

  return (racesJson.races ?? []).map((race) => ({
    round: String(race.round ?? ""),
    name: race.raceName ?? "",
    date:
      race.schedule?.race?.date ??
      (typeof race.date === "string" ? race.date : ""),
    location: formatLocation(race),
    winner: formatWinner(race.winner ?? null),
  }));
}
