import { Season } from "@/entities/season/model";
import type {
  ConstructorStandingsApiResponse,
  DriverStandingsApiResponse,
  Race,
  RacesApiResponse,
} from "@f1api/sdk";
import { getF1Api } from "@/lib/services/f1api";

const EARLIEST_SEASON = 1950;

function formatLocation(race: Race): string {
  const city = race.circuit?.city ?? "";
  const country = race.circuit?.country ?? "";

  if (city && country) {
    return `${city}, ${country}`;
  }

  return city || country || "";
}

function formatWinner(winner: Race["winner"] | null): string | undefined {
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
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const client = getF1Api();

  const [raceJson, driverJson, constructorJson] = await Promise.all([
    client
      .getRacesByYear({ year: Number(season), limit: 200 })
      .catch((error) => {
        if ((error as Error).name === "AbortError") {
          throw error;
        }

        console.error("[fetchSeasonSnapshot] races lookup failed", error);
        return null;
      }),
    client
      .getDriverStandings({ year: Number(season) })
      .catch((error) => {
        if ((error as Error).name === "AbortError") {
          throw error;
        }

        console.error("[fetchSeasonSnapshot] driver standings failed", error);
        return null;
      }),
    client
      .getConstructorStandings({ year: Number(season) })
      .catch((error) => {
        if ((error as Error).name === "AbortError") {
          throw error;
        }

        console.error(
          "[fetchSeasonSnapshot] constructor standings failed",
          error,
        );
        return null;
      }),
  ]);

  const raceCount = (raceJson as RacesApiResponse | null)?.races?.length ?? 0;
  const driverChampion =
    (driverJson as DriverStandingsApiResponse | null)?.drivers_championship?.[0];
  const constructorChampion =
    (constructorJson as ConstructorStandingsApiResponse | null)?.constructors_championship?.[0];

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
  const racesJson = await getF1Api().getRacesByYear({
    year: Number(season),
    limit: 200,
  });

  return (racesJson.races ?? []).map((race) => ({
    round: String(race.round ?? ""),
    name: race.raceName ?? "",
    date: race.schedule?.race?.date ?? "",
    location: formatLocation(race),
    winner: formatWinner(race.winner ?? null),
  }));
}
