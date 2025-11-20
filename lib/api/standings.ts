import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";
import type {
  ConstructorStandingsApiResponse,
  DriverStandingsApiResponse,
} from "@f1api/sdk";
import { getF1Api } from "@/lib/services/f1api";

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  const json = await getF1Api().getDriverStandings({
    year: Number(season),
  });
  const standings = (json as DriverStandingsApiResponse).drivers_championship ?? [];

  return standings.map((s) => ({
    position: String(s.position ?? ""),
    wins: s.wins ?? 0,
    points: String(s.points ?? 0),
    driver: [s.driver?.name, s.driver?.surname].filter(Boolean).join(" "),
    constructor: s.team?.teamName ?? "",
    nationality: s.driver?.nationality ?? "",
  }));
}

export async function fetchConstructorStandings(
  season: string,
): Promise<ConstructorStanding[]> {
  const json = await getF1Api().getConstructorStandings({
    year: Number(season),
  });
  const standings =
    (json as ConstructorStandingsApiResponse).constructors_championship ?? [];

  return standings.map((s) => ({
    position: String(s.position ?? ""),
    points: String(s.points ?? 0),
    wins: s.wins ?? 0,
    constructor: s.team?.teamName ?? "",
    nationality: s.team?.country ?? "",
  }));
}
