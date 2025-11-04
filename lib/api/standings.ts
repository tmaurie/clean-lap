import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";
import { API_ROUTES } from "@/lib/config/api";

type DriverStandingsResponse = {
  drivers_championship?: Array<{
    position?: number | string;
    wins?: number | null;
    points?: number | string;
    driver?: {
      name?: string;
      surname?: string;
      nationality?: string;
    };
    team?: {
      teamName?: string;
    };
  }>;
};

type ConstructorStandingsResponse = {
  constructors_championship?: Array<{
    position?: number | string;
    wins?: number | null;
    points?: number | string;
    team?: {
      teamName?: string;
      country?: string;
    };
  }>;
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return (await res.json()) as T;
}

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  const json = await fetchJSON<DriverStandingsResponse>(
    API_ROUTES.driverStandings(season),
  );
  const standings = json.drivers_championship ?? [];

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
  const json = await fetchJSON<ConstructorStandingsResponse>(
    API_ROUTES.constructorStandings(season),
  );
  const standings = json.constructors_championship ?? [];

  return standings.map((s) => ({
    position: String(s.position ?? ""),
    points: String(s.points ?? 0),
    wins: s.wins ?? 0,
    constructor: s.team?.teamName ?? "",
    nationality: s.team?.country ?? "",
  }));
}
