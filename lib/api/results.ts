import { Season } from "@/entities/season/model";
import { API_BASE_URL, fetchApi } from "@/lib/api/client";
import type { ApiSeasonResponse } from "@/lib/api/types";
import { normalizeCircuit } from "@/lib/api/types";

const NEW_API_BASE_URL = API_BASE_URL;
const EARLIEST_SEASON = 1950;

/**
 * La liste des saisons n'affiche que le champion : demander le classement
 * complet ramenait ~12 Ko par saison et par championnat pour n'en lire que la
 * première ligne. `?limit=1` renvoie exactement l'entrée en position 1
 * (vérifié de 1998 à 2024) et ramène la réponse à ~0,7 Ko.
 */
const CHAMPION_ONLY = "?limit=1";

async function fetchJsonSafe<T>(
  url: string,
  season: string,
  signal?: AbortSignal,
): Promise<T | null> {
  try {
    return await fetchApi<T>(url, { season, signal });
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
      fetchJsonSafe<SeasonApiResponse>(
        `${NEW_API_BASE_URL}/${season}`,
        season,
        signal,
      ),
      fetchJsonSafe<DriverChampionshipResponse>(
        `${NEW_API_BASE_URL}/${season}/drivers-championship${CHAMPION_ONLY}`,
        season,
        signal,
      ),
      fetchJsonSafe<ConstructorChampionshipResponse>(
        `${NEW_API_BASE_URL}/${season}/constructors-championship${CHAMPION_ONLY}`,
        season,
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

  return Promise.all(
    seasons.map((season) => fetchSeasonSnapshot(season, signal)),
  );
}

export async function fetchRacesWithWinner(season: string): Promise<
  {
    round: string;
    name: string;
    date: string;
    time?: string;
    circuit?: string;
    location: string;
    winner?: string;
    winnerTeam?: string;
  }[]
> {
  const json = await fetchApi<ApiSeasonResponse>(
    `${NEW_API_BASE_URL}/${season}`,
    { season },
  );
  const races = json?.races ?? [];
  return races.map((race) => {
    const winnerName = race?.winner
      ? `${race.winner.name ?? ""} ${race.winner.surname ?? ""}`.trim()
      : undefined;
    const circuit = normalizeCircuit(race.circuit);

    return {
      round: race.round?.toString() ?? "-",
      name: race.raceName ?? "Grand Prix",
      date: race.schedule?.race?.date ?? race.date ?? "",
      time: race.schedule?.race?.time ?? undefined,
      circuit: circuit?.circuitName ?? undefined,
      location: circuit
        ? [circuit.city, circuit.country].filter(Boolean).join(", ")
        : "Lieu inconnu",
      winner: winnerName || undefined,
      winnerTeam: race?.teamWinner?.teamName ?? undefined,
    };
  });
}
