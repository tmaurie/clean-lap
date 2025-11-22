import {
  DriverStanding,
  ConstructorStanding,
} from "@/entities/standings/model";

export async function fetchDriverStandings(
  season: string,
): Promise<DriverStanding[]> {
  const res = await fetch(
    `https://f1api.dev/api/${season}/drivers-championship`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch driver standings for ${season}`);
  }

  const json = await res.json();
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
  const res = await fetch(
    `https://f1api.dev/api/${season}/constructors-championship`,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch constructor standings for ${season}`);
  }

  const json = await res.json();
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
