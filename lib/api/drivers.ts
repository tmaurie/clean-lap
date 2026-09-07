import {
  Driver,
  DriverRaceResult,
  DriverSeason,
} from "@/entities/driver/model";
import { API_BASE_URL, fetchApi } from "@/lib/api/client";
import type {
  ApiDriver,
  ApiDriverSeasonEntry,
  ApiDriverSeasonResponse,
  ApiDriversResponse,
} from "@/lib/api/types";
import { toArray } from "@/lib/api/types";

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

/**
 * L'ancienne version empilait une dizaine de replis spéculatifs (`r.score`,
 * `r.startingGrid`, `raceData.race.name`…) pour des formes que l'endpoint ne
 * renvoie pas. Le typage les a mis en évidence : ils ne pouvaient jamais être
 * atteints, et ils masquaient la forme réelle.
 *
 * On s'en tient donc à ce que `/api/{saison}/drivers/{id}` renvoie
 * effectivement (cf. docs/api/driver_result.json), tout en gardant les deux
 * alias réellement observés : `name` ici contre `raceName` ailleurs, et
 * `finishingPosition` / `position` sur le sprint.
 */
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
    const sprintPoints = Number(sprint?.pointsObtained ?? sprint?.points ?? 0);

    return {
      round: race?.round ?? null,
      raceName: race?.name ?? race?.raceName ?? "Grand Prix",
      date: race?.date ?? race?.schedule?.race?.date ?? null,
      grid: result?.gridPosition ?? null,
      position: result?.finishingPosition ?? null,
      sprintPosition: sprint?.finishingPosition ?? sprint?.position ?? null,
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
  const base =
    season === "current"
      ? `${API_BASE_URL}/current/drivers`
      : season
        ? `${API_BASE_URL}/${season}/drivers`
        : `${API_BASE_URL}/drivers`;

  try {
    const json = await fetchApi<ApiDriversResponse>(base, { season });
    // Selon l'endpoint, la liste arrive sous `drivers` ou sous `driver`, et
    // `driver` est parfois un objet seul. Le typage a rendu ce cas explicite.
    const list = json?.drivers ?? toArray(json?.driver);
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
    const url = `${API_BASE_URL}/${season}/${driverId.includes("/") ? driverId : `drivers/${driverId}`}`;
    const json = await fetchApi<ApiDriverSeasonResponse>(url, { season });
    // `json.driver?.[0]` et `json.driverRaces` étaient des replis morts :
    // inatteignables dès lors que `json.driver` / `json.results` existent, et
    // absents de la réponse quand ils n'existent pas.
    // L'endpoint pilote-saison renvoie l'écurie dans un champ **frère** de
    // `driver`, pas à l'intérieur : sans ce rattachement, `teamId` restait
    // vide et la fiche pilote affichait « Équipe inconnue » pour tout le
    // monde, couleur d'écurie comprise.
    const driverInfo = json?.driver
      ? { ...json.driver, teamId: json.driver.teamId ?? json.team?.teamId }
      : undefined;
    const races = mapDriverRaceResults(json?.results ?? []);

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
