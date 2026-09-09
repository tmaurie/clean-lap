import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";
import { API_BASE_URL, fetchApi } from "@/lib/api/client";
import type {
  ApiConstructorChampionshipResponse,
  ApiDriverChampionshipResponse,
} from "@/lib/api/types";

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  // Ces appels n'avaient aucune option de cache : chaque rendu repayait les
  // ~4-5 s de f1api.dev, y compris pour des saisons closes et immuables.
  const json = await fetchApi<ApiDriverChampionshipResponse>(
    `${API_BASE_URL}/${season}/drivers-championship`,
    { season },
  );
  const standings = json?.drivers_championship ?? [];

  return standings.map(
    (entry): DriverStanding => ({
      position: entry.position?.toString() ?? "-",
      wins: entry.wins ?? 0,
      points: entry.points?.toString() ?? "0",
      driver:
        `${entry.driver?.name ?? ""} ${entry.driver?.surname ?? ""}`.trim(),
      // Comme `teamId`, tantôt sur l'entrée, tantôt dans l'objet imbriqué.
      driverId: entry.driverId ?? entry.driver?.driverId ?? null,
      constructor: entry.team?.teamName ?? "N/A",
      // `teamId` est tantôt dans `team`, tantôt au niveau de l'entrée.
      constructorId: entry.team?.teamId ?? entry.teamId ?? null,
      nationality: entry.driver?.nationality ?? entry.driver?.country ?? "N/A",
    }),
  );
}

export async function fetchConstructorStandings(
  season: string,
): Promise<ConstructorStanding[]> {
  const json = await fetchApi<ApiConstructorChampionshipResponse>(
    `${API_BASE_URL}/${season}/constructors-championship`,
    { season },
  );
  const standings = json?.constructors_championship ?? [];

  return standings.map(
    (entry): ConstructorStanding => ({
      position: entry.position?.toString() ?? "-",
      points: entry.points?.toString() ?? "0",
      wins: entry.wins ?? 0,
      constructor: entry.team?.teamName ?? "N/A",
      // `teamId` est tantôt dans `team`, tantôt au niveau de l'entrée.
      constructorId: entry.team?.teamId ?? entry.teamId ?? null,
      nationality: entry.team?.country ?? "N/A",
    }),
  );
}
