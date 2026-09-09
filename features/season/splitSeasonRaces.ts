import { isPastRace } from "@/lib/utils/date";

type DatedRace = { date: string; time?: string | null };

/**
 * Sépare une saison en manches courues et manches à venir.
 *
 * Le tri se fait sur la date, **pas sur la présence d'un vainqueur** :
 * f1api.dev ne renseigne `winner` que pour 2024 et après (vérifié de 1990 à
 * 2026, où 2019 à 2023 renvoient `winner: null` sur les 22 manches). Trier
 * là-dessus affichait donc toute saison antérieure comme entièrement « à
 * venir », badge « Ce week-end » compris sur la manche d'ouverture.
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
