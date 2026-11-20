import { isPastRace } from "@/lib/utils/date";

type DatedRace = { date: string; time?: string | null };

/**
 * Sépare une saison en manches courues et manches à venir.
 *
 * La date permet de classer une manche dont le vainqueur est encore inconnu.
 *
 * `now` est injectable pour que tout un rendu partage la même horloge.
 */
export function splitSeasonRaces<T extends DatedRace>(
  races: T[],
  now: Date = new Date(),
): { completed: T[]; remaining: T[] } {
  const completed: T[] = [];
  const remaining: T[] = [];

  for (const race of races) {
    if (isPastRace(race.date, race.time, now)) {
      completed.push(race);
    } else {
      remaining.push(race);
    }
  }

  return { completed, remaining };
}

/** Une manche est « ce week-end » si elle part dans les sept jours. */
export function isThisWeekend(
  race: DatedRace,
  now: Date = new Date(),
): boolean {
  const start = new Date(`${race.date}T${race.time ?? "23:59:59Z"}`).getTime();
  if (Number.isNaN(start)) return false;

  const days = (start - now.getTime()) / 86_400_000;
  return days >= 0 && days <= 7;
}
