import type { Race } from "@/entities/race/model";
import type { CalendarEvent } from "@/lib/calendar/ics";
import {
  SESSION_DURATION_MINUTES,
  type WeekendSession,
} from "@/lib/utils/session";
import { toRaceDate } from "@/lib/utils/date";

/** Rappel demandé par l'item : une heure avant le départ. */
export const ALARM_MINUTES = 60;

const DAY_MS = 86_400_000;

function uid(season: string, round: number | string, suffixe: string): string {
  return `f1-${season}-${round}-${suffixe}@cleanlap`;
}

/**
 * Une manche par événement, pour l'export d'une saison entière.
 *
 * Sans heure connue — le cas des saisons anciennes chez f1api.dev — on pose un
 * événement d'une journée plutôt qu'un horaire inventé, et sans rappel : « une
 * heure avant » n'a pas de sens sur une journée entière.
 */
export function seasonEvents(
  season: string,
  races: Race[],
  origin: string,
): CalendarEvent[] {
  return races.flatMap((race, index): CalendarEvent[] => {
    const start = toRaceDate(race.date, race.time);
    if (!start) return [];

    const round = race.round ?? index + 1;
    const allDay = !race.time;

    return [
      {
        uid: uid(season, round, "race"),
        start: allDay ? new Date(`${race.date}T00:00:00Z`) : start,
        end: allDay
          ? new Date(new Date(`${race.date}T00:00:00Z`).getTime() + DAY_MS)
          : new Date(start.getTime() + SESSION_DURATION_MINUTES.race * 60_000),
        allDay,
        summary: `F1 — ${race.name}`,
        location: race.location,
        description: [
          `Manche ${round} de la saison ${season}.`,
          race.circuit ? `Circuit : ${race.circuit}.` : null,
        ]
          .filter(Boolean)
          .join(" "),
        url: `${origin}/results/${season}/${round}`,
        alarmMinutesBefore: allDay ? null : ALARM_MINUTES,
      },
    ];
  });
}

/**
 * Toutes les sessions d'un week-end : essais, qualifications, sprint, course.
 * Chacune porte son propre rappel — quelqu'un qui ajoute le week-end complet
 * veut être prévenu de chaque séance qu'il vient d'ajouter.
 */
export function weekendEvents(
  season: string,
  round: number | string,
  raceName: string,
  location: string,
  sessions: WeekendSession[],
  origin: string,
): CalendarEvent[] {
  return sessions.map((session) => ({
    uid: uid(season, round, session.key),
    start: session.startsAt,
    end: session.endsAt,
    summary: `F1 ${session.shortLabel} — ${raceName}`,
    location,
    description: `${session.label} · manche ${round} de la saison ${season}.`,
    url: `${origin}/weekend`,
    alarmMinutesBefore: ALARM_MINUTES,
  }));
}
