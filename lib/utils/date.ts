export function getTimeUntilLabel(
  dateString: string,
): { label: string; className: string } | null {
  const now = new Date();
  const target = new Date(dateString);
  const diffDays = Math.floor(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0)
    return { label: "Aujourd'hui", className: "bg-blue-100 text-blue-800" };
  if (diffDays < 7 && diffDays > 0)
    return {
      label: "Dans moins d'une semaine",
      className: "bg-blue-100 text-blue-800",
    };
  if (diffDays >= 7 && diffDays < 14)
    return {
      label: "Dans 1 semaine",
      className: "bg-green-100 text-green-800",
    };
  if (diffDays >= 14 && diffDays < 30)
    return {
      label: "Dans 2 semaines",
      className: "bg-yellow-100 text-yellow-800",
    };
  if (diffDays >= 30 && diffDays < 60)
    return { label: "Dans 1 mois", className: "bg-orange-100 text-orange-800" };
  if (diffDays >= 60 && diffDays <= 90)
    return { label: "Dans 2 mois", className: "bg-red-100 text-red-800" };
  if (diffDays > 90)
    return {
      label: "Dans plus de 3 mois",
      className: "bg-gray-100 text-gray-800",
    };
  if (diffDays < 0)
    return { label: "Course passée", className: "bg-gray-100 text-gray-800" };

  return null;
}

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
