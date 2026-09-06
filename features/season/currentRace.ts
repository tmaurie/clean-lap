import { Race } from "@/entities/race/model";
import { isPastRace, toRaceDate } from "@/lib/utils/date";

export type CurrentRace = {
  /** Le calendrier trié sur l'horaire réel de départ. */
  calendar: Race[];
  /** Index dans `calendar` de la manche en cours, -1 si la saison est finie. */
  index: number;
  race: Race | null;
  /** Numéro de manche de l'API, avec l'index en dernier recours. */
  round: number | null;
  total: number;
};

/**
 * Résout la manche « en cours » — c'est-à-dire la première qui n'est pas
 * terminée, heure de départ comprise.
 *
 * Centralisé ici parce que trois écrans en dépendent (home, en-tête, page
 * week-end) et que la version d'origine, dupliquée, déduisait la manche du
 * nombre de courses passées : ça supposait le tri chronologique du tableau
 * **et** que l'index valait le numéro de manche.
 */
export function resolveCurrentRace(
  races: Race[],
  now: Date = new Date(),
): CurrentRace {
  const calendar = [...races].sort(
    (a, b) =>
      (toRaceDate(a.date, a.time)?.getTime() ?? 0) -
      (toRaceDate(b.date, b.time)?.getTime() ?? 0),
  );

  const index = calendar.findIndex(
    (race) => !isPastRace(race.date, race.time, now),
  );
  const race = index === -1 ? null : calendar[index];

  return {
    calendar,
    index,
    race,
    round: race ? (race.round ?? index + 1) : null,
    total: calendar.length,
  };
}
