/**
 * f1api.dev expose la date ("2025-03-16") et l'heure ("04:00:00Z") dans deux
 * champs distincts. Sans heure connue, on vise la fin de la journée UTC :
 * sinon une course programmée aujourd'hui à 15 h est datée de minuit et
 * considérée comme déjà courue pendant toute la journée.
 */
export function toRaceDate(
  date?: string | null,
  time?: string | null,
): Date | null {
  if (!date) return null;

  const normalizedTime = time
    ? time.endsWith("Z")
      ? time
      : `${time}Z`
    : "23:59:59Z";

  const parsed = new Date(`${date}T${normalizedTime}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isPastRace(
  date: string,
  time?: string | null,
  /** Injectable pour que tout un calcul partage la même horloge. */
  now: Date = new Date(),
): boolean {
  const target = toRaceDate(date, time);
  if (!target) return false;
  return target.getTime() < now.getTime();
}

/**
 * Fuseau d'affichage. L'app est francophone (`<html lang="fr">`), et les pages
 * sont rendues côté serveur : sans fuseau explicite, les horaires prendraient
 * celui de la machine — donc UTC une fois déployé sur Vercel. On fige donc le
 * fuseau plutôt que de dépendre de l'hôte.
 */
export const DISPLAY_TIME_ZONE = "Europe/Paris";

/** Ex. « sam. 5 sept. » */
export function formatSessionDay(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/** Ex. « 16:00 » */
export function formatSessionTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/**
 * Jour d'une course, pour affichage.
 *
 * Piège : sans heure, `toRaceDate` vise 23:59:59 UTC — formaté dans un fuseau
 * en avance sur UTC, ça bascule au lendemain. Le GP d'Italie 2024, couru le
 * 1er septembre, s'affichait « 2 septembre ». On formate donc en UTC quand
 * l'heure est inconnue, et en heure de Paris quand elle est connue.
 */
export function formatRaceDay(
  date?: string | null,
  time?: string | null,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string | null {
  const parsed = toRaceDate(date, time);
  if (!parsed) return null;

  return parsed.toLocaleDateString("fr-FR", {
    ...options,
    timeZone: time ? DISPLAY_TIME_ZONE : "UTC",
  });
}
