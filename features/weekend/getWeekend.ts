import { Race } from "@/entities/race/model";
import { resolveCurrentRace } from "@/features/season/currentRace";
import {
  RaceCircuitDetails,
  fetchFreePracticeResults,
  fetchQualifyingResults,
  fetchRaceResults,
  fetchRaceSchedule,
  fetchRaces,
  fetchSprintResults,
} from "@/lib/api/race";
import type { PracticeResults } from "@/lib/api/openf1";
import { buildWeekendSessions, WeekendSession } from "@/lib/utils/session";

export type SessionPodiumEntry = {
  position: string;
  driver: string;
  constructor: string;
  /** Temps, écart ou points selon la session. */
  detail: string;
};

export type WeekendSessionView = WeekendSession & {
  podium: SessionPodiumEntry[];
  practiceStatus?: PracticeResults["status"];
};

export type Weekend = {
  race: Race;
  season: number;
  round: number;
  total: number;
  sessions: WeekendSessionView[];
  circuit?: RaceCircuitDetails;
};

async function safePodium(
  load: () => Promise<SessionPodiumEntry[]>,
  session: string,
): Promise<SessionPodiumEntry[]> {
  try {
    return await load();
  } catch (error) {
    console.warn(`[getWeekend] résultats indisponibles pour ${session}`, error);
    return [];
  }
}

async function loadSessionResults(
  session: WeekendSession,
  season: string,
  round: string,
  now: Date,
): Promise<Pick<WeekendSessionView, "podium" | "practiceStatus">> {
  if (session.status !== "done") return { podium: [] };

  const key = session.key;
  if (key === "fp1" || key === "fp2" || key === "fp3") {
    const { results, status } = await fetchFreePracticeResults(
      season,
      round,
      key,
      now,
    );
    return {
      practiceStatus: status,
      podium: results.slice(0, 3).map((result) => ({
        position: result.position,
        driver: result.driver,
        constructor: result.constructor,
        detail: result.time,
      })),
    };
  }

  const podium = await loadPodium(key, season, round);
  return { podium };
}

async function loadPodium(
  key: Exclude<WeekendSession["key"], "fp1" | "fp2" | "fp3">,
  season: string,
  round: string,
): Promise<SessionPodiumEntry[]> {
  switch (key) {
    case "qualy":
      return safePodium(async () => {
        const { results } = await fetchQualifyingResults(season, round);
        return results.slice(0, 3).map((r) => ({
          position: r.position,
          driver: r.driver,
          constructor: r.constructor,
          detail: r.q3 ?? r.q2 ?? r.q1 ?? "—",
        }));
      }, "qualy");

    case "sprintRace":
      return safePodium(async () => {
        const { results } = await fetchSprintResults(season, round);
        return results.slice(0, 3).map((r) => ({
          position: r.position,
          driver: r.driver,
          constructor: r.constructor,
          detail: `${r.points} pts`,
        }));
      }, "sprintRace");

    case "race":
      return safePodium(async () => {
        const race = await fetchRaceResults(season, round);
        return (race?.results ?? []).slice(0, 3).map((r) => ({
          position: r.position,
          driver: r.driver,
          constructor: r.constructor,
          detail: `${r.points} pts`,
        }));
      }, "race");

    // Les qualifs sprint n'ont pas d'endpoint dédié dans la couche API :
    // la session est affichée avec son horaire et son état, sans classement.
    case "sprintQualy":
      return [];
  }
}

/**
 * Le week-end « en cours » : la première manche non terminée du calendrier,
 * avec ses sessions ordonnées, leur état et le podium de celles déjà courues.
 * Renvoie `null` quand la saison est finie ou le planning indisponible.
 */
export async function getCurrentWeekend(
  now: Date = new Date(),
): Promise<Weekend | null> {
  const races = await fetchRaces("current");
  // Une seule horloge pour tout le calcul : sélection de la manche ET état
  // des sessions. Deux `new Date()` distincts se désynchronisent en test comme
  // au passage d'une session à l'autre.
  const { race, round, total } = resolveCurrentRace(races, now);

  if (!race || round === null) return null;

  const scheduleData = await fetchRaceSchedule("current", String(round));
  if (!scheduleData) return null;

  const season = scheduleData.season ?? new Date().getFullYear();

  const sessions = buildWeekendSessions(scheduleData.schedule, now);
  const sessionResults = await Promise.all(
    sessions.map((session) =>
      loadSessionResults(session, String(season), String(round), now),
    ),
  );

  return {
    race,
    season,
    round,
    total,
    circuit: scheduleData.circuitDetails,
    sessions: sessions.map((session, index) => ({
      ...session,
      ...sessionResults[index],
    })),
  };
}
