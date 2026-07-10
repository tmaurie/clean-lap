import {
  Driver,
  DriverRaceResult,
  DriverSeason,
} from "@/entities/driver/model";

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function mapDriver(d: any): Driver {
  return {
    id: d?.driverId,
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

function mapDriverRaceResults(raw: any[]): DriverRaceResult[] {
  return raw.map((r: any) => {
    const raceData = r?.race ?? r;
    const resultData = r?.result ?? r;
    const sprintData = r?.sprintResult ?? r?.sprint ?? null;
    const raceName =
      raceData?.raceName ??
      raceData?.name ??
      raceData?.race?.name ??
      "Grand Prix";
    const round = raceData?.round ?? raceData?.race?.round ?? null;
    const circuitData = raceData?.circuit ?? raceData?.race?.circuit;
    const location = circuitData
      ? `${circuitData.city ?? ""}${circuitData.city ? ", " : ""}${circuitData.country ?? ""}`.trim() ||
        null
      : (r?.location ?? null);

    const grid =
      resultData?.gridPosition ??
      resultData?.grid ??
      r?.gridPosition ??
      r?.grid ??
      r?.startingGrid ??
      r?.qualyPosition ??
      null;
    const position =
      resultData?.finishingPosition ??
      resultData?.position ??
      r?.position ??
      r?.result ??
      null;

    const pointsVal =
      resultData?.pointsObtained ??
      resultData?.points ??
      r?.pointsObtained ??
      r?.points ??
      r?.score ??
      r?.racePoints ??
      null;
    const racePoints = Number(pointsVal ?? 0);
    const sprintPoints = Number(
      sprintData?.pointsObtained ??
        sprintData?.points ??
        sprintData?.score ??
        0,
    );
    const points = racePoints + sprintPoints;

    const date =
      raceData?.date ??
      raceData?.race?.date ??
      r?.date ??
      r?.schedule?.race?.date ??
      raceData?.schedule?.race?.date ??
      null;

    return {
      round,
      raceName,
      date,
      grid,
      position,
      sprintPosition:
        sprintData?.finishingPosition ??
        sprintData?.position ??
        sprintData?.result ??
        null,
      sprintPoints,
      points,
      status: r?.retired ?? r?.status ?? null,
      location,
    };
  });
}

export async function fetchDrivers(options?: {
  season?: string;
  search?: string;
}) {
  const { season, search } = options || {};
  const base =
    season === "current"
      ? "https://f1api.dev/api/current/drivers"
      : season
        ? `https://f1api.dev/api/${season}/drivers`
        : "https://f1api.dev/api/drivers";

  try {
    const json = await fetchJSON(base);
    const list = json?.drivers ?? json?.driver ?? [];
    const drivers: Driver[] = list.map(mapDriver);

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
  try {
    const url = `https://f1api.dev/api/${season}/${driverId.includes("/") ? driverId : `drivers/${driverId}`}`;
    const json = await fetchJSON(url);
    const driverInfo = json?.driver ?? json?.driver?.[0] ?? json?.drivers?.[0];
    const racesRaw = json?.results ?? json?.races ?? json?.driverRaces ?? [];
    const races = mapDriverRaceResults(racesRaw);

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
      driver: driverInfo
        ? mapDriver(driverInfo)
        : { id: driverId, name: "", surname: "" },
      races,
      stats: {
        wins,
        podiums,
        points: pointsTotal,
        avgGrid: avgGrid !== null ? Number(avgGrid.toFixed(1)) : null,
      },
    };
  } catch (error) {
    console.error("[fetchDriverSeason] failed", error);
    return null;
  }
}
