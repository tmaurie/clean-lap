import { Season } from "@/entities/season/model";

const NEW_API_BASE_URL = "https://f1api.dev/api";
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

type SeasonApiResponse = {
  season?: number | string;
  races?: Array<{
    winner?: {
      name?: string;
      surname?: string;
      country?: string;
    } | null;
    teamWinner?: { teamName?: string } | null;
  }>;
  championship?: {
    driverChampion?: {
      name?: string;
      surname?: string;
      country?: string;
      nationality?: string;
    };
    constructorChampion?: string;
    teamChampion?: string;
  };
};

type DriverChampionshipResponse = {
  drivers_championship?: Array<{
    position?: number;
    driver?: {
      name?: string;
      surname?: string;
      nationality?: string;
      country?: string;
    };
  }>;
};

type ConstructorChampionshipResponse = {
  constructors_championship?: Array<{
    position?: number;
    team?: {
      teamName?: string;
      country?: string;
    };
  }>;
};

async function fetchSeasonSnapshot(
  season: string,
  signal?: AbortSignal,
): Promise<Season> {
  const [seasonJson, driverChampionshipJson, constructorChampionshipJson] =
    await Promise.all([
      fetchJsonSafe<SeasonApiResponse>(`${NEW_API_BASE_URL}/${season}`, signal),
      fetchJsonSafe<DriverChampionshipResponse>(
        `${NEW_API_BASE_URL}/${season}/drivers-championship`,
        signal,
      ),
      fetchJsonSafe<ConstructorChampionshipResponse>(
        `${NEW_API_BASE_URL}/${season}/constructors-championship`,
        signal,
      ),
    ]);

  const driverChampionFromSeason = seasonJson?.championship?.driverChampion;
  const driverChampionFromClassification =
    driverChampionshipJson?.drivers_championship?.find(
      (entry) => entry.position === 1,
    ) ?? driverChampionshipJson?.drivers_championship?.[0];

  const driverChampion =
    driverChampionFromSeason ?? driverChampionFromClassification?.driver;
  const constructorChampionFromClassification =
    constructorChampionshipJson?.constructors_championship?.find(
      (entry) => entry.position === 1,
    ) ?? constructorChampionshipJson?.constructors_championship?.[0];

  const constructorChampion =
    seasonJson?.championship?.constructorChampion ??
    seasonJson?.championship?.teamChampion ??
    constructorChampionFromClassification?.team?.teamName;
  const driverNationality =
    driverChampion?.country ?? driverChampion?.nationality;

  return {
    season: seasonJson?.season?.toString() ?? season,
    raceCount: seasonJson?.races?.length ?? 0,
    driverChampion:
      driverChampion?.name && driverChampion?.surname && driverNationality
        ? {
            name: `${driverChampion.name} ${driverChampion.surname}`,
            nationality: driverNationality,
          }
        : undefined,
    constructorChampion: constructorChampion ?? undefined,
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
  const json = await fetchJson<{ races?: any[] }>(
    `${NEW_API_BASE_URL}/${season}`,
  );
  const races = json?.races ?? [];
  return races.map((race) => {
    const winnerName = race?.winner
      ? `${race.winner.name ?? ""} ${race.winner.surname ?? ""}`.trim()
      : undefined;
    return {
      round: race.round?.toString() ?? "-",
      name: race.raceName ?? "Grand Prix",
      date: race.schedule?.race?.date ?? race.date ?? "",
      location: race.circuit
        ? `${race.circuit.city}, ${race.circuit.country}`
        : "Lieu inconnu",
      winner: winnerName || undefined,
    };
  });
}
