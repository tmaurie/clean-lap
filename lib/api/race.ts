import { Race, RaceResult } from "@/entities/race/model";

export type QualifyingResult = {
  position: string;
  driver: string;
  driverNationality?: string;
  constructor: string;
  grid: string;
  points: string;
  q1?: string;
  q2?: string;
  q3?: string;
  bestTimes?: { q1: number | null; q2: number | null; q3: number | null };
};

export type QualifyingSession = {
  raceName: string;
  location: string;
  date: string | null;
  time: string | null;
  results: QualifyingResult[];
};

export type FreePracticeResult = {
  position: string;
  driver: string;
  driverNationality?: string;
  constructor: string;
  time: string;
};

export type RaceSession = {
  date: string | null;
  time: string | null;
};

export type RaceSchedule = {
  fp1: RaceSession;
  fp2: RaceSession;
  fp3: RaceSession;
  qualy: RaceSession;
  sprintQualy: RaceSession;
  sprintRace: RaceSession;
  race: RaceSession;
};

export type RaceCircuitDetails = {
  name?: string | null;
  country?: string | null;
  city?: string | null;
  circuitLength?: string | null;
  lapRecord?: string | null;
  firstParticipationYear?: number | null;
  corners?: number | null;
  fastestLapDriverId?: string | null;
  fastestLapTeamId?: string | null;
  fastestLapYear?: number | null;
  url?: string | null;
};

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  console.log(`[fetchJSON] fetching URL: ${url}`, res);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function mapRace(race: any): Race {
  const location = [race.circuit?.city, race.circuit?.country]
    .filter(Boolean)
    .join(", ");

  return {
    name: race.raceName,
    date: race.schedule?.race?.date ?? race.date,
    time: race.schedule?.race?.time ?? race.time,
    circuit: race.circuit?.circuitName,
    location,
  };
}

function fastest(value?: string | null) {
  if (!value) return null;
  const numeric = Number(value.replace(/[:.]/g, ""));
  return Number.isNaN(numeric) ? null : numeric;
}

function mapQualifyingResults(results: any[]): QualifyingResult[] {
  const bestTimes = results.reduce(
    (
      acc: { q1: number | null; q2: number | null; q3: number | null },
      r: any,
    ) => ({
      q1:
        fastest(r.q1) !== null && (acc.q1 === null || fastest(r.q1)! < acc.q1)
          ? fastest(r.q1)
          : acc.q1,
      q2:
        fastest(r.q2) !== null && (acc.q2 === null || fastest(r.q2)! < acc.q2)
          ? fastest(r.q2)
          : acc.q2,
      q3:
        fastest(r.q3) !== null && (acc.q3 === null || fastest(r.q3)! < acc.q3)
          ? fastest(r.q3)
          : acc.q3,
    }),
    { q1: null, q2: null, q3: null },
  );

  return results.map((q: any) => ({
    position: q.gridPosition?.toString() ?? q.position?.toString() ?? "-",
    driver: `${q.driver?.name ?? ""} ${q.driver?.surname ?? ""}`.trim(),
    driverNationality: q.driver?.nationality,
    constructor: q.team?.teamName ?? "N/A",
    grid: "-", // pas nécessaire en qualif
    q1: q.q1 ?? undefined,
    q2: q.q2 ?? undefined,
    q3: q.q3 ?? undefined,
    points: "0",
    bestTimes,
  }));
}

function mapFreePracticeResults(results: any[]): FreePracticeResult[] {
  return results.map((fp: any, index: number) => ({
    position: fp.position?.toString() ?? (index + 1).toString(),
    driver: `${fp.driver?.name ?? ""} ${fp.driver?.surname ?? ""}`.trim(),
    driverNationality: fp.driver?.nationality,
    constructor: fp.team?.teamName ?? "N/A",
    time: fp.time ?? "N/A",
  }));
}

function normalizeScheduleEntry(session: any | undefined): {
  date: string | null;
  time: string | null;
} {
  return {
    date: session?.date ?? null,
    time: session?.time ?? null,
  };
}

export async function fetchNextRace(): Promise<Race | null> {
  try {
    const json = await fetchJSON("https://f1api.dev/api/current/next");
    console.log(json.race[0]);
    const raceData = json.race[0];
    return {
      name: raceData.raceName,
      date: raceData.schedule.race.date,
      time: raceData.schedule.race.time,
      circuit: raceData.circuit.circuitName,
      location: `${raceData.circuit.city}, ${raceData.circuit.country}`,
    };
  } catch (err) {
    console.error("[fetchNextRace] Failed to parse race data", err);
    return null;
  }
}

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const json = await fetchJSON("https://f1api.dev/api/current");
  const races = json.races;
  const now = new Date();

  return races
    .map((raceData: any) => ({
      name: raceData.raceName,
      date: raceData.schedule.race.date,
      time: raceData.schedule.race.time,
      circuit: raceData.circuit.circuitName,
      location: `${raceData.circuit.city}, ${raceData.circuit.country}`,
    }))
    .filter((race: Race) => {
      const raceDateTime = new Date(`${race.date}T${race.time}`);
      return raceDateTime > now;
    });
}

export async function fetchRaces(season: string): Promise<Race[]> {
  const json = await fetchJSON(`https://f1api.dev/api/${season}`);
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
  const json = await fetchJSON(`https://f1api.dev/api/${season}/${round}/race`);
  const race = json?.races;
  const results = race?.results ?? [];
  const fastestLapValue = (time: string | null | undefined) => {
    if (!time) return null;
    const numeric = Number(time.replace(/[:.]/g, ""));
    return Number.isNaN(numeric) ? null : numeric;
  };
  const bestFastestLap = results.reduce((best: number | null, r: any) => {
    const lapTime = fastestLapValue(r.fastLap);
    if (lapTime === null) return best;
    if (best === null || lapTime < best) return lapTime;
    return best;
  }, null);

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location: race?.circuit
      ? `${race.circuit.city}, ${race.circuit.country}`
      : "Lieu inconnu",
    date: race?.date,
    time: race?.time,
    circuit: {
      name: race?.circuit?.circuitName,
      locality: race?.circuit?.city,
      country: race?.circuit?.country,
      url: race?.circuit?.url,
    },
    results: results.map(
      (r: any): RaceResult => ({
        position: r.position?.toString(),
        driver: `${r.driver?.name ?? ""} ${r.driver?.surname ?? ""}`.trim(),
        driverNationality: r.driver?.nationality,
        constructor: r.team?.teamName,
        time: r.time ?? r.retired ?? "N/A",
        points: r.points?.toString() ?? "0",
        fastestLap: r.fastLap
          ? {
              rank:
                bestFastestLap !== null &&
                fastestLapValue(r.fastLap) === bestFastestLap
                  ? "1"
                  : (r.fastestLapRank?.toString() ?? "-"),
              lap: r.fastestLapLap?.toString() ?? "-",
              time: r.fastLap,
              averageSpeed: r.fastLapSpeed,
            }
          : undefined,
        grid: r.grid?.toString() ?? "-",
      }),
    ),
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
  const url = `https://f1api.dev/api/${season}/${round}/sprint/race`;
  const res = await fetch(url);
  if (res.status === 404) {
    return { results: [] };
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const results = json?.races?.sprintRaceResults ?? [];

  return {
    results: results.map((r: any) => ({
      position: r.position?.toString() ?? "-",
      driver: `${r.driver?.name ?? ""} ${r.driver?.surname ?? ""}`.trim(),
      constructor: r.team?.teamName ?? "N/A",
      laps: "-", // non fourni par la nouvelle API sprint
      grid: r.gridPosition?.toString() ?? "-",
      time: r.time ?? r.retired ?? "N/A",
      points: r.points?.toString() ?? "0",
    })),
  };
}

export async function fetchFreePracticeResults(
  season: string,
  round: string,
  session: "fp1" | "fp2" | "fp3",
): Promise<{ results: FreePracticeResult[] }> {
  const url = `https://f1api.dev/api/${season}/${round}/${session}`;
  const res = await fetch(url);

  if (res.status === 404) {
    return { results: [] };
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const results =
    json?.races?.[`${session}Results`] ??
    json?.races?.results ??
    json?.races ??
    [];

  return { results: mapFreePracticeResults(results) };
}

export async function fetchQualifyingResults(
  season: string,
  round: string,
): Promise<{
  results: QualifyingResult[];
}> {
  const json = await fetchJSON(
    `https://f1api.dev/api/${season}/${round}/qualy`,
  );
  const results = json?.races?.qualyResults ?? [];

  return {
    results: mapQualifyingResults(results),
  };
}

export async function fetchLastQualifying(): Promise<QualifyingSession | null> {
  try {
    const json = await fetchJSON("https://f1api.dev/api/current/last/qualy");
    const race = json?.races;
    if (!race) return null;

    return {
      raceName: race?.raceName ?? "Qualifications",
      location: race?.circuit
        ? `${race.circuit.city}, ${race.circuit.country}`
        : "Lieu inconnu",
      date:
        race?.schedule?.qualy?.date ?? race?.qualyDate ?? race?.date ?? null,
      time:
        race?.schedule?.qualy?.time ?? race?.qualyTime ?? race?.time ?? null,
      results: mapQualifyingResults(race?.qualyResults ?? []),
    };
  } catch (error) {
    console.error("[fetchLastQualifying] Failed to fetch data", error);
    return null;
  }
}

export async function fetchRaceSchedule(
  season: string,
  round: string,
): Promise<{
  schedule: RaceSchedule;
  circuitDetails?: RaceCircuitDetails;
} | null> {
  try {
    const baseUrl =
      season === "current"
        ? "https://f1api.dev/api/current"
        : `https://f1api.dev/api/${season}`;
    const json = await fetchJSON(baseUrl);
    const races = json?.races ?? [];

    const byRound =
      round === "last"
        ? races
            .slice()
            .sort(
              (a: any, b: any) => Number(b.round ?? 0) - Number(a.round ?? 0),
            )[0]
        : races.find((r: any) => String(r.round) === String(round));

    const race = byRound ?? null;
    const schedule = race?.schedule;
    if (!schedule) return null;

    return {
      schedule: {
        fp1: normalizeScheduleEntry(schedule.fp1),
        fp2: normalizeScheduleEntry(schedule.fp2),
        fp3: normalizeScheduleEntry(schedule.fp3),
        qualy: normalizeScheduleEntry(schedule.qualy),
        sprintQualy: normalizeScheduleEntry(schedule.sprintQualy),
        sprintRace: normalizeScheduleEntry(schedule.sprintRace),
        race: normalizeScheduleEntry(schedule.race ?? race),
      },
      circuitDetails: race?.circuit
        ? {
            name: race.circuit.circuitName,
            country: race.circuit.country,
            city: race.circuit.city,
            circuitLength: race.circuit.circuitLength,
            lapRecord: race.circuit.lapRecord,
            firstParticipationYear: race.circuit.firstParticipationYear,
            corners: race.circuit.corners,
            fastestLapDriverId: race.circuit.fastestLapDriverId,
            fastestLapTeamId: race.circuit.fastestLapTeamId,
            fastestLapYear: race.circuit.fastestLapYear,
            url: race.circuit.url,
          }
        : undefined,
    };
  } catch (error) {
    console.error("[fetchRaceSchedule] Failed to fetch data", error);
    return null;
  }
}
