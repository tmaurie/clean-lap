import { resolveCurrentRace } from "@/features/season/currentRace";
import { fetchRaces } from "@/lib/api/race";

export type SeasonProgress = {
  year: number;
  round: number;
  total: number;
};

/**
 * Avancement de la saison, résolu **côté serveur** dans le Shell.
 *
 * C'était auparavant un `useQuery` dans l'en-tête : chaque page déclenchait
 * donc, depuis le navigateur, un chargement du calendrier complet (~4-5 s)
 * uniquement pour afficher « R13/23 ». Côté serveur, l'appel est mutualisé
 * avec celui des pages et servi par le cache de fetch.
 *
 * `null` si l'API est indisponible : l'en-tête ne doit jamais faire tomber
 * l'application entière.
 */
export async function getSeasonProgress(): Promise<SeasonProgress | null> {
  try {
    const races = await fetchRaces("current");
    const { round, total } = resolveCurrentRace(races);

    if (total === 0) return null;

    return {
      year: new Date().getFullYear(),
      // Saison terminée : on affiche la dernière manche disputée.
      round: round ?? total,
      total,
    };
  } catch (error) {
    console.warn("[getSeasonProgress] indisponible", error);
    return null;
  }
}
