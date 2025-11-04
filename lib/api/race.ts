import { Race, RaceResult } from "@/entities/race/model";
import { API_ROUTES } from "@/lib/config/api";

type ApiRace = {
  raceName?: string;
  date?: string;
  time?: string;
  schedule?: {
    race?: { date?: string; time?: string };
  };
  Circuit?: {
    circuitName?: string;
    Location?: { locality?: string; country?: string };
  };
  circuit?: {
    circuitName?: string;
    city?: string;
    country?: string;
  };
};

type ApiRaceResult = {
  position?: number | string;
  finishingPosition?: number;
  driver?: {
    name?: string;
    surname?: string;
    nationality?: string;
  };
  Driver?: {
    givenName?: string;
    familyName?: string;
    nationality?: string;
  };
  team?: { teamName?: string };
  Constructor?: { name?: string };
  grid?: number | string;
  gridPosition?: number | string;
  laps?: number | string;
  time?: string;
  raceTime?: string;
  points?: number | string;
  pointsObtained?: number | string;
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: { time?: string };
    AverageSpeed?: { speed?: string };
  };
  fastLap?: string | null;
  retired?: boolean | null;
  sprintResult?: {
    raceTime?: string;
  } | null;
  q1?: string;
  q2?: string;
  q3?: string;
  Q1?: string;
  Q2?: string;
  Q3?: string;
};

type RaceResultsResponse = {
  races?:
    | {
        raceName?: string;
        date?: string;
        time?: string;
        circuit?: {
          circuitName?: string;
          city?: string;
          country?: string;
          url?: string;
        };
        results?: ApiRaceResult[];
      }
    | Array<{
        raceName?: string;
        date?: string;
        time?: string;
        circuit?: {
          circuitName?: string;
          city?: string;
          country?: string;
          url?: string;
        };
        results?: ApiRaceResult[];
      }>;
};

type SprintRaceResultsResponse = {
  races?:
    | {
        sprintRaceResults?: ApiRaceResult[];
      }
    | Array<{ sprintRaceResults?: ApiRaceResult[] }>;
};

type QualyResultsResponse = {
  races?:
    | {
        qualyResults?: ApiRaceResult[];
      }
    | Array<{ qualyResults?: ApiRaceResult[] }>;
};

type NextRaceResponse = {
  race?: ApiRace[];
};

type RacesResponse = {
  races?: ApiRace[];
};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return (await res.json()) as T;
}

function extractDate(race: ApiRace): { date: string; time: string } {
  const date = race.schedule?.race?.date ?? race.date ?? "";
  const time = race.schedule?.race?.time ?? race.time ?? "";

  return { date, time };
}

function formatLocation(race: ApiRace): string {
  const locality =
    race.circuit?.city ?? race.Circuit?.Location?.locality ?? "";
  const country =
    race.circuit?.country ?? race.Circuit?.Location?.country ?? "";

  if (locality && country) {
    return `${locality}, ${country}`;
  }

  return locality || country || "";
}

function mapRace(race: ApiRace): Race {
  const { date, time } = extractDate(race);
  const circuitName = race.circuit?.circuitName ?? race.Circuit?.circuitName ?? "";

  return {
    name: race.raceName ?? "",
    date,
    time,
    circuit: circuitName,
    location: formatLocation(race),
  };
}

function mapRaceResults(results: ApiRaceResult[]): RaceResult[] {
  return results.map(
    (r): RaceResult => {
      const position = r.position ?? r.finishingPosition ?? "";
      const driverName =
        r.driver?.name || r.driver?.surname
          ? [r.driver?.name, r.driver?.surname].filter(Boolean).join(" ")
          : [r.Driver?.givenName, r.Driver?.familyName]
              .filter(Boolean)
              .join(" ");
      const nationality =
        r.driver?.nationality ?? r.Driver?.nationality ?? undefined;
      const constructorName =
        r.team?.teamName ?? r.Constructor?.name ?? "";
      const grid = r.grid ?? r.gridPosition ?? "";
      const laps = r.laps ?? undefined;
      const time =
        r.time ??
        r.raceTime ??
        r.sprintResult?.raceTime ??
        (r.retired ? "Retired" : "-");
      const points = r.points ?? r.pointsObtained ?? 0;
      const fastestLapTime =
        r.fastLap ?? r.FastestLap?.Time?.time ?? undefined;

      return {
        position: String(position ?? ""),
        driver: driverName,
        driverNationality: nationality,
        constructor: constructorName,
        time: time ?? "",
        points: String(points ?? 0),
        fastestLap: fastestLapTime
          ? {
              rank: r.FastestLap?.rank ?? "",
              lap: r.FastestLap?.lap ?? "",
              time: fastestLapTime,
              averageSpeed: r.FastestLap?.AverageSpeed?.speed ?? "",
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
    const json = await fetchJSON<NextRaceResponse>(API_ROUTES.nextRace);
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
  const json = await fetchJSON<RacesResponse>(
    API_ROUTES.races(currentYear, { limit: 200 }),
  );
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
  const json = await fetchJSON<RacesResponse>(
    API_ROUTES.races(season, { limit: 200 }),
  );
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
  const json = await fetchJSON<RaceResultsResponse>(
    API_ROUTES.raceResults(season, round),
  );

  const race = Array.isArray(json.races) ? json.races[0] : json.races;

  const circuit = race?.circuit ?? {};
  const location = [circuit.city, circuit.country].filter(Boolean).join(", ");

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location,
    date: race?.date ?? "",
    time: race?.time ?? "",
    circuit: {
      name: circuit.circuitName ?? "",
      locality: circuit.city ?? "",
      country: circuit.country ?? "",
      url: circuit.url ?? "",
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
  const json = await fetchJSON<SprintRaceResultsResponse>(
    API_ROUTES.sprintRaceResults(season, round),
  );
  const race = Array.isArray(json.races) ? json.races[0] : json.races;
  const results = race?.sprintRaceResults ?? [];

  return {
    results: results.map((r) => {
      const mapped = mapRaceResults([r])[0];
      return {
        position: mapped.position,
        driver: mapped.driver,
        constructor: mapped.constructor,
        laps: mapped.laps ?? "-",
        grid: mapped.grid,
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
  const json = await fetchJSON<QualyResultsResponse>(
    API_ROUTES.qualifyingResults(season, round),
  );
  const race = Array.isArray(json.races) ? json.races[0] : json.races;
  const results = race?.qualyResults ?? [];

  return {
    results: results.map((q) => {
      const mapped = mapRaceResults([q])[0];
      return {
        position: mapped.position,
        driver: mapped.driver,
        constructor: mapped.constructor,
        grid: mapped.grid,
        time: mapped.time,
        points: mapped.points,
        q1: q.q1 ?? q.Q1 ?? undefined,
        q2: q.q2 ?? q.Q2 ?? undefined,
        q3: q.q3 ?? q.Q3 ?? undefined,
      };
    }),
  };
}
