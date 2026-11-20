import {
  Driver,
  DriverRaceResult,
  DriverSeason,
} from "@/entities/driver/model";
import { jolpicaDrivers, jolpicaDriverSeason } from "./jolpica";
import type { ApiDriver, ApiDriverSeasonEntry } from "./types";

function mapDriver(d: ApiDriver): Driver {
  return {
    id: d?.driverId ?? "",
    name: d?.name ?? "",
    surname: d?.surname ?? "",
    nationality: d?.nationality ?? "",
    birthday: d?.birthday ?? null,
    number: d?.number ?? null,
    shortName: d?.shortName ?? null,
    url: d?.url ?? null,
    teamId: d?.teamId ?? null,
  };
}

function mapDriverRaceResults(raw: ApiDriverSeasonEntry[]): DriverRaceResult[] {
  return raw.map((entry) => {
    const race = entry.race;
    const result = entry.result;
    const sprint = entry.sprintResult ?? null;

    const circuit = race?.circuit;
    const location = circuit
      ? [circuit.city, circuit.country].filter(Boolean).join(", ") || null
      : null;

    const racePoints = Number(result?.pointsObtained ?? 0);
    const sprintPoints = Number(sprint?.points ?? 0);

    return {
      round: race?.round ?? null,
      raceName: race?.name ?? "Grand Prix",
      date: race?.date ?? null,
      grid: result?.gridPosition ?? null,
      position: result?.finishingPosition ?? null,
      sprintPosition: sprint?.position ?? null,
      sprintPoints,
      points: racePoints + sprintPoints,
      status: result?.retired ?? null,
      location,
    };
  });
}

export async function fetchDrivers(options?: {
  season?: string;
  search?: string;
}) {
  const { season, search } = options || {};
  try {
    const drivers = (await jolpicaDrivers(season)).map(mapDriver);
    const query = search?.trim().toLowerCase();
    if (!query) return drivers;

    return drivers.filter((d) =>
      `${d.name} ${d.surname} ${d.shortName ?? ""} ${d.id}`
        .toLowerCase()
        .includes(query),
    );
  } catch (error) {
    console.error("[fetchDrivers] failed", error);
    return [];
  }
}

export async function fetchDriverSeason(
  driverId: string,
  season: string,
): Promise<DriverSeason | null> {
  const data = await jolpicaDriverSeason(driverId, season);
  if (!data?.driver) return null;

  const driver = mapDriver({ ...data.driver, teamId: data.team?.teamId });
  const races = mapDriverRaceResults(data.results ?? []);

  const wins = races.filter(
    (r) => r.position === 1 || r.position === "1",
  ).length;
  const podiums = races.filter((r) => {
    const pos = Number(r.position);
    return Number.isFinite(pos) && pos > 0 && pos <= 3;
  }).length;
  const pointsTotal = races.reduce(
    (sum, r) => sum + (Number(r.points) || 0),
    0,
  );
  const validGrids = races
    .filter((r) => r.grid !== null && r.grid !== undefined && r.grid !== "")
    .map((r) => Number(r.grid))
    .filter((g) => Number.isFinite(g));
  const avgGrid =
    validGrids.length > 0
      ? validGrids.reduce((sum, g) => sum + g, 0) / validGrids.length
      : null;

  return {
    season,
    driver,
    races,
    stats: {
      wins,
      podiums,
      points: pointsTotal,
      avgGrid: avgGrid !== null ? Number(avgGrid.toFixed(1)) : null,
    },
  };
}
