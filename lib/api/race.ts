import { Race, RaceResult } from "@/entities/race/model";
import { fastestLapTimeMs, isFastestTime } from "@/lib/utils/time";
import {
  jolpicaCalendar,
  jolpicaRace,
  jolpicaSession,
  seasonYear,
} from "./jolpica";
import { loadPractice, type PracticeKey, type PracticeResults } from "./openf1";
import type {
  ApiQualyResult,
  ApiRace,
  ApiScheduleEntry,
} from "@/lib/api/types";

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
  /**
   * Meilleur temps de la session, résolu ici plutôt que dans la couche de
   * rendu : les colonnes n'ont pas à re-parser des chaînes de temps.
   */
  isFastestQ1: boolean;
  isFastestQ2: boolean;
  isFastestQ3: boolean;
};

export type SprintResult = {
  position: string;
  driver: string;
  constructor: string;
  laps: string;
  grid: string;
  time: string;
  points: string;
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

function mapRace(race: ApiRace): Race {
  const circuit = race.circuit;
  const location = [circuit?.city, circuit?.country].filter(Boolean).join(", ");

  const round = Number(race.round);

  return {
    round: Number.isFinite(round) ? round : null,
    // Valeurs de repli : le modèle promet des chaînes, l'API ne les garantit
    // pas. Sans elles on affichait « undefined » dans l'interface.
    name: race.raceName ?? "Grand Prix",
    date: race.schedule?.race?.date ?? race.date ?? "",
    time: race.schedule?.race?.time ?? race.time ?? null,
    circuit: circuit?.circuitName ?? "Circuit inconnu",
    circuitId: circuit?.circuitId ?? null,
    location,
  };
}

function mapQualifyingResults(results: ApiQualyResult[]): QualifyingResult[] {
  const bestQ1 = fastestLapTimeMs(results.map((r) => r.q1));
  const bestQ2 = fastestLapTimeMs(results.map((r) => r.q2));
  const bestQ3 = fastestLapTimeMs(results.map((r) => r.q3));

  return results.map((q) => ({
    position: q.position?.toString() ?? "—",
    driver: `${q.driver?.name ?? ""} ${q.driver?.surname ?? ""}`.trim(),
    driverNationality: q.driver?.nationality,
    constructor: q.team?.teamName ?? "N/A",
    grid: "-", // pas nécessaire en qualif
    q1: q.q1 ?? undefined,
    q2: q.q2 ?? undefined,
    q3: q.q3 ?? undefined,
    points: "0",
    isFastestQ1: isFastestTime(q.q1, bestQ1),
    isFastestQ2: isFastestTime(q.q2, bestQ2),
    isFastestQ3: isFastestTime(q.q3, bestQ3),
  }));
}

function normalizeScheduleEntry(session: ApiScheduleEntry | undefined): {
  date: string | null;
  time: string | null;
} {
  return {
    date: session?.date ?? null,
    time: session?.time ?? null,
  };
}

export async function fetchRaces(season: string): Promise<Race[]> {
  return (await jolpicaCalendar(season)).map(mapRace);
}

/**
 * `null` quand la manche n'existe pas : c'est le test d'existence utilisé par
 * la page résultats pour rendre un vrai 404.
 */
export async function fetchRaceResults(
  season: string,
  round: string,
): Promise<null | {
  raceName: string;
  location: string;
  date: string;
  time: string;
  circuit: {
    id: string | null;
    name: string;
    locality: string;
    country: string;
    url: string;
  };
  results: RaceResult[];
}> {
  const scheduled = round === "last" ? null : await jolpicaRace(season, round);
  if (round !== "last" && !scheduled) return null;

  const published = await jolpicaSession(season, round, "results");
  const race = published ?? scheduled;
  if (!race) return null;

  const circuit = race.circuit;
  const results = race?.results ?? [];
  const bestFastestLap = fastestLapTimeMs(results.map((r) => r.fastLap));

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location: circuit ? `${circuit.city}, ${circuit.country}` : "Lieu inconnu",
    date: race?.date ?? "",
    time: race?.time ?? "",
    circuit: {
      // Le typage a montré que ces quatre champs pouvaient être `undefined`
      // alors que le modèle les annonce en `string` : on les comble ici
      // plutôt que d'afficher « undefined ».
      id: circuit?.circuitId ?? null,
      name: circuit?.circuitName ?? "Circuit inconnu",
      locality: circuit?.city ?? "",
      country: circuit?.country ?? "",
      url: circuit?.url ?? "",
    },
    results: results.map(
      (r): RaceResult => ({
        position: r.position?.toString() ?? "-",
        driver: `${r.driver?.name ?? ""} ${r.driver?.surname ?? ""}`.trim(),
        driverNationality: r.driver?.nationality,
        constructor: r.team?.teamName ?? "N/A",
        time: r.time ?? r.retired ?? "N/A",
        points: r.points?.toString() ?? "0",
        fastestLap: r.fastLap
          ? {
              rank: isFastestTime(r.fastLap, bestFastestLap)
                ? "1"
                : (r.fastestLapRank?.toString() ?? "-"),
              lap: r.fastestLapLap?.toString() ?? "-",
              time: r.fastLap,
              averageSpeed: r.fastLapSpeed ?? "-",
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
): Promise<{ results: SprintResult[] }> {
  const race = await jolpicaSession(season, round, "sprint");
  return {
    results: (race?.sprintRaceResults ?? []).map((result) => ({
      position: result.position?.toString() ?? "—",
      driver:
        `${result.driver?.name ?? ""} ${result.driver?.surname ?? ""}`.trim(),
      constructor: result.team?.teamName ?? "—",
      laps: result.laps ?? "—",
      grid: result.gridPosition?.toString() ?? "—",
      time: result.time ?? result.retired ?? "—",
      points: result.points?.toString() ?? "0",
    })),
  };
}

export async function fetchFreePracticeResults(
  season: string,
  round: string,
  session: PracticeKey,
  now = new Date(),
): Promise<PracticeResults> {
  const race = await raceWithSchedule(season, round);
  return race
    ? loadPractice(race, session, now)
    : { results: [], status: "notScheduled" };
}

export async function fetchQualifyingResults(
  season: string,
  round: string,
): Promise<{ results: QualifyingResult[] }> {
  const race = await jolpicaSession(season, round, "qualifying");
  return { results: mapQualifyingResults(race?.qualyResults ?? []) };
}

async function raceWithSchedule(
  season: string,
  round: string,
): Promise<ApiRace | null> {
  if (round !== "last") return jolpicaRace(season, round);
  const last = await jolpicaSession(season, round, "results");
  return last?.round === undefined
    ? null
    : jolpicaRace(season, String(last.round));
}

export async function fetchRaceSchedule(
  season: string,
  round: string,
): Promise<{
  season: number | null;
  schedule: RaceSchedule;
  circuitDetails?: RaceCircuitDetails;
} | null> {
  const race = await raceWithSchedule(season, round);
  const schedule = race?.schedule;
  if (!schedule) return null;

  const circuit = race.circuit;
  const resolvedSeason = Number(seasonYear(season));

  return {
    season: Number.isFinite(resolvedSeason) ? resolvedSeason : null,
    schedule: {
      fp1: normalizeScheduleEntry(schedule.fp1),
      fp2: normalizeScheduleEntry(schedule.fp2),
      fp3: normalizeScheduleEntry(schedule.fp3),
      qualy: normalizeScheduleEntry(schedule.qualy),
      sprintQualy: normalizeScheduleEntry(schedule.sprintQualy),
      sprintRace: normalizeScheduleEntry(schedule.sprintRace),
      race: normalizeScheduleEntry(schedule.race ?? race),
    },
    circuitDetails: circuit
      ? {
          name: circuit.circuitName,
          country: circuit.country,
          city: circuit.city,
          circuitLength: circuit.circuitLength
            ? `${(circuit.circuitLength / 1000).toFixed(3)} km`
            : null,
          lapRecord: circuit.lapRecord,
          firstParticipationYear: circuit.firstParticipationYear,
          corners: circuit.corners,
          fastestLapDriverId: circuit.fastestLapDriverId,
          fastestLapTeamId: circuit.fastestLapTeamId,
          fastestLapYear: circuit.fastestLapYear,
          url: circuit.url,
        }
      : undefined,
  };
}
