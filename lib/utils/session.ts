import { toRaceDate } from "@/lib/utils/date";

export type SessionKey =
  | "fp1"
  | "fp2"
  | "fp3"
  | "sprintQualy"
  | "sprintRace"
  | "qualy"
  | "race";

export type SessionStatus = "done" | "live" | "upcoming";

export type ScheduleEntry = { date: string | null; time: string | null };

export type WeekendSession = {
  key: SessionKey;
  label: string;
  shortLabel: string;
  startsAt: Date;
  endsAt: Date;
  status: SessionStatus;
};

/**
 * f1api.dev ne donne que l'heure de **départ** d'une session, jamais sa fin.
 * Ces durées sont les durées réglementaires usuelles, arrondies vers le haut
 * pour absorber drapeaux rouges et cérémonie du podium. Elles ne servent qu'à
 * décider si une session est « en cours » ou « terminée » : aucune donnée
 * affichée n'en dépend.
 */
const SESSION_DURATION_MINUTES: Record<SessionKey, number> = {
  fp1: 60,
  fp2: 60,
  fp3: 60,
  sprintQualy: 45,
  sprintRace: 60,
  qualy: 60,
  race: 150,
};

const SESSION_LABELS: Record<SessionKey, { long: string; short: string }> = {
  fp1: { long: "Essais libres 1", short: "FP1" },
  fp2: { long: "Essais libres 2", short: "FP2" },
  fp3: { long: "Essais libres 3", short: "FP3" },
  sprintQualy: { long: "Qualifications sprint", short: "SQ" },
  sprintRace: { long: "Course sprint", short: "Sprint" },
  qualy: { long: "Qualifications", short: "Qualif" },
  race: { long: "Course", short: "Course" },
};

export const SESSION_KEYS = Object.keys(SESSION_LABELS) as SessionKey[];

export function sessionStatus(
  startsAt: Date,
  endsAt: Date,
  now: Date,
): SessionStatus {
  if (now.getTime() >= endsAt.getTime()) return "done";
  if (now.getTime() >= startsAt.getTime()) return "live";
  return "upcoming";
}

/**
 * Transforme le planning brut de l'API en sessions ordonnées chronologiquement.
 *
 * Les sessions non programmées sont écartées : c'est ce qui distingue
 * naturellement un week-end sprint (FP1, SQ, Sprint, Qualif, Course) d'un
 * week-end classique (FP1, FP2, FP3, Qualif, Course), sans avoir à coder en
 * dur l'un ou l'autre format.
 */
export function buildWeekendSessions(
  schedule: Partial<Record<SessionKey, ScheduleEntry | undefined>>,
  now: Date = new Date(),
): WeekendSession[] {
  return SESSION_KEYS.flatMap((key) => {
    const entry = schedule[key];
    const startsAt = toRaceDate(entry?.date, entry?.time);
    if (!startsAt) return [];

    const endsAt = new Date(
      startsAt.getTime() + SESSION_DURATION_MINUTES[key] * 60_000,
    );

    return [
      {
        key,
        label: SESSION_LABELS[key].long,
        shortLabel: SESSION_LABELS[key].short,
        startsAt,
        endsAt,
        status: sessionStatus(startsAt, endsAt, now),
      },
    ];
  }).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** Session en cours si elle existe, sinon la prochaine à venir. */
export function currentOrNextSession(
  sessions: WeekendSession[],
): WeekendSession | null {
  return (
    sessions.find((session) => session.status === "live") ??
    sessions.find((session) => session.status === "upcoming") ??
    null
  );
}

export function isSprintWeekend(sessions: WeekendSession[]): boolean {
  return sessions.some((session) => session.key === "sprintRace");
}

/** Le week-end est terminé quand toutes ses sessions le sont. */
export function isWeekendOver(sessions: WeekendSession[]): boolean {
  return (
    sessions.length > 0 &&
    sessions.every((session) => session.status === "done")
  );
}
