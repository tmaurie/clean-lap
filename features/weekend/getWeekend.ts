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
};

export type Weekend = {
  race: Race;
  season: number;
  round: number;
  total: number;
  sessions: WeekendSessionView[];
  circuit?: RaceCircuitDetails;
};

/**
 * Les résultats d'une session peuvent manquer alors même qu'elle est terminée
 * (publication différée côté f1api.dev, séance annulée, saison ancienne). On
 * renvoie alors un podium vide : la page doit rester affichable, pas tomber en
 * 500 comme le fait aujourd'hui `/results/[season]/[round]`.
 */
async function safePodium(
  load: () => Promise<SessionPodiumEntry[]>,
  session: string,
): Promise<SessionPodiumEntry[]> {
  try {
    return await load();
  } catch (error) {
    // `warn` et pas `error` : pendant un week-end en cours, f1api.dev répond
    // 404 sur les sessions dont les résultats ne sont pas encore publiés.
    // C'est un état normal, pas une panne — et Next compte les console.error
    // comme des issues dans son overlay de dev.
    console.warn(`[getWeekend] résultats indisponibles pour ${session}`, error);
    return [];
  }
}

async function loadPodium(
  session: WeekendSession,
  season: string,
  round: string,
): Promise<SessionPodiumEntry[]> {
  // Rien à afficher tant que la session n'a pas eu lieu — et surtout aucun
  // appel à payer : f1api.dev répond en ~4-5 s.
  if (session.status !== "done") return [];

  switch (session.key) {
    case "fp1":
    case "fp2":
    case "fp3":
      return safePodium(async () => {
        const { results } = await fetchFreePracticeResults(
          season,
          round,
          session.key as "fp1" | "fp2" | "fp3",
        );
        return results.slice(0, 3).map((r) => ({
          position: r.position,
          driver: r.driver,
          constructor: r.constructor,
          detail: r.time,
        }));
      }, session.key);

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

  // Les endpoints de session n'acceptent pas l'alias "current" : on repart de
  // l'année renvoyée par l'API, avec l'année courante en dernier recours.
  const season = scheduleData.season ?? new Date().getFullYear();

  const sessions = buildWeekendSessions(scheduleData.schedule, now);
  const podiums = await Promise.all(
    sessions.map((session) =>
      loadPodium(session, String(season), String(round)),
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
      podium: podiums[index],
    })),
  };
}
