import { Race, RaceResult } from "@/entities/race/model";
import type {
  QualyResultsApiResponse,
  Race as ApiRace,
  RaceClassification,
  RaceResultsApiResponse,
  SprintRaceResultsApiResponse,
} from "@f1api/sdk";
import { getF1Api } from "@/lib/services/f1api";

function extractDate(race: ApiRace): { date: string; time: string } {
  const date = race.schedule?.race?.date ?? "";
  const time = race.schedule?.race?.time ?? "";

  return { date, time };
}

function formatLocation(race: ApiRace): string {
  const locality = race.circuit?.city ?? "";
  const country = race.circuit?.country ?? "";

  if (locality && country) {
    return `${locality}, ${country}`;
  }

  return locality || country || "";
}

function mapRace(race: ApiRace): Race {
  const { date, time } = extractDate(race);
  const circuitName = race.circuit?.circuitName ?? "";

  return {
    name: race.raceName ?? "",
    date,
    time,
    circuit: circuitName,
    location: formatLocation(race),
  };
}

function mapRaceResults(results: RaceClassification[]): RaceResult[] {
  return results.map(
    (r): RaceResult => {
      const position = r.position ?? 0;
      const driverName = [r.driver?.name, r.driver?.surname]
        .filter(Boolean)
        .join(" ");
      const nationality = r.driver?.nationality ?? undefined;
      const constructorName = r.team?.teamName ?? "";
      const grid = r.grid ?? 0;
      const laps = r.laps ?? undefined;
      const time = r.retired ? "Retired" : r.time || "-";
      const points = r.points ?? 0;
      const fastestLapTime = r.fastLap ?? undefined;

      return {
        position: String(position ?? ""),
        driver: driverName,
        driverNationality: nationality,
        constructor: constructorName,
        time: time ?? "",
        points: String(points ?? 0),
        fastestLap: fastestLapTime
          ? {
              rank: "",
              lap: "",
              time: fastestLapTime,
              averageSpeed: "",
            }
          : undefined,
        grid: String(grid ?? ""),
        laps: laps !== undefined ? String(laps) : undefined,
      };
    },
  );
}

export async function fetchNextRace(): Promise<Race | null> {
  try {
    const json = await getF1Api().getNextRace();
    const raceData = json.race?.[0];
    if (!raceData) {
      return null;
    }

    return mapRace(raceData);
  } catch (err) {
    console.error("[fetchNextRace] Failed to parse race data", err);
    return null;
  }
}

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const currentYear = new Date().getFullYear();
  const json = await getF1Api().getRacesByYear({
    year: currentYear,
    limit: 200,
  });
  const races = json.races ?? [];
  const now = new Date();

  return races
    .map(mapRace)
    .filter((race) => {
      if (!race.date) {
        return false;
      }

      const date = new Date(`${race.date}T${race.time || "00:00:00"}`);
      return date > now;
    });
}

export async function fetchRaces(season: string): Promise<Race[]> {
  const json = await getF1Api().getRacesByYear({
    year: Number(season),
    limit: 200,
  });
  const rawRaces = json.races ?? [];
  return rawRaces.map(mapRace);
}

export async function fetchRaceResults(
  season: string,
  round: string,
): Promise<{
  raceName: string;
  location: string;
  date: string;
  time: string;
  circuit: {
    name: string;
    locality: string;
    country: string;
    url: string;
  };
  results: RaceResult[];
}> {
  const json = await getF1Api().getRaceResults({
    year: Number(season),
    round: Number(round),
  });

  const race = (json as RaceResultsApiResponse).races;

  const circuit = race?.circuit ?? ({} as ApiRace["circuit"]);
  const location = [circuit?.city, circuit?.country].filter(Boolean).join(", ");

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location,
    date: race?.date ?? "",
    time: race?.time ?? "",
    circuit: {
      name: circuit?.circuitName ?? "",
      locality: circuit?.city ?? "",
      country: circuit?.country ?? "",
      url: circuit?.url ?? "",
    },
    results: mapRaceResults(race?.results ?? []),
  };
}

export async function fetchSprintResults(
  season: string,
  round: string,
): Promise<{
  results: {
    position: string;
    driver: string;
    constructor: string;
    laps: string;
    grid: string;
    time: string;
    points: string;
  }[];
}> {
  const json = await getF1Api().getSprintRaceResults({
    year: Number(season),
    round: Number(round),
  });
  const results = (json as SprintRaceResultsApiResponse).races?.sprintRaceResults ?? [];

  return {
    results: results.map((r) => {
      const mapped = mapRaceResults([r])[0];
      return {
        position: mapped.position,
        driver: mapped.driver,
        constructor: mapped.constructor,
        laps: mapped.laps ?? "-",
        grid: String(r.gridPosition ?? mapped.grid),
        time: mapped.time,
        points: mapped.points,
      };
    }),
  };
}

export async function fetchQualifyingResults(
  season: string,
  round: string,
): Promise<{
  results: {
    position: string;
    driver: string;
    constructor: string;
    grid: string;
    time: string;
    points: string;
    q1?: string;
    q2?: string;
    q3?: string;
  }[];
}> {
  const json = await getF1Api().getQualyResults({
    year: Number(season),
    round: Number(round),
  });
  const results = (json as QualyResultsApiResponse).races?.qualyResults ?? [];

  return {
    results: results.map((q) => {
      const mapped = mapRaceResults([q])[0];
      return {
        position: mapped.position,
        driver: mapped.driver,
        constructor: mapped.constructor,
        grid: String(q.gridPosition ?? mapped.grid),
        time: mapped.time,
        points: mapped.points,
        q1: q.q1 ?? undefined,
        q2: q.q2 ?? undefined,
        q3: q.q3 ?? undefined,
      };
    }),
  };
}
