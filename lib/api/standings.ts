import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";
import { API_BASE_URL, fetchApi } from "@/lib/api/client";

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  // Ces appels n'avaient aucune option de cache : chaque rendu repayait les
  // ~4-5 s de f1api.dev, y compris pour des saisons closes et immuables.
  const json = await fetchApi<any>(
    `${API_BASE_URL}/${season}/drivers-championship`,
    { season },
  );
  const standings = json?.drivers_championship ?? [];

  return standings.map(
    (entry: any): DriverStanding => ({
      position: entry.position?.toString() ?? "-",
      wins: entry.wins ?? 0,
      points: entry.points?.toString() ?? "0",
      driver:
        `${entry.driver?.name ?? ""} ${entry.driver?.surname ?? ""}`.trim(),
      constructor: entry.team?.teamName ?? "N/A",
      nationality: entry.driver?.nationality ?? entry.driver?.country ?? "N/A",
    }),
  );
}

export async function fetchConstructorStandings(
  season: string,
): Promise<ConstructorStanding[]> {
  const json = await fetchApi<any>(
    `${API_BASE_URL}/${season}/constructors-championship`,
    { season },
  );
  const standings = json?.constructors_championship ?? [];

  return standings.map(
    (entry: any): ConstructorStanding => ({
      position: entry.position?.toString() ?? "-",
      points: entry.points?.toString() ?? "0",
      wins: entry.wins ?? 0,
      constructor: entry.team?.teamName ?? "N/A",
      nationality: entry.team?.country ?? "N/A",
    }),
  );
}
