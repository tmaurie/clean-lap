import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";
import { jolpicaConstructorStandings, jolpicaDriverStandings } from "./jolpica";

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  const standings = await jolpicaDriverStandings(season);
  return standings.map(
    (entry): DriverStanding => ({
      position: entry.position?.toString() ?? "-",
      wins: entry.wins ?? 0,
      points: entry.points?.toString() ?? "0",
      driver:
        `${entry.driver?.name ?? ""} ${entry.driver?.surname ?? ""}`.trim(),
      driverId: entry.driver?.driverId ?? null,
      constructor: entry.team?.teamName ?? "N/A",
      constructorId: entry.team?.teamId ?? null,
      nationality: entry.driver?.nationality ?? "N/A",
    }),
  );
}

export async function fetchConstructorStandings(
  season: string,
): Promise<ConstructorStanding[]> {
  const standings = await jolpicaConstructorStandings(season);
  return standings.map(
    (entry): ConstructorStanding => ({
      position: entry.position?.toString() ?? "-",
      points: entry.points?.toString() ?? "0",
      wins: entry.wins ?? 0,
      constructor: entry.team?.teamName ?? "N/A",
      constructorId: entry.team?.teamId ?? null,
      nationality: entry.team?.nationality ?? "N/A",
    }),
  );
}
