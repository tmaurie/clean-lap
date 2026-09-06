export const EARLIEST_SEASON = 1950;

export function currentSeason(): string {
  return new Date().getFullYear().toString();
}

/**
 * Normalise une saison venue de l'URL. Tout ce qui n'est pas une année du
 * calendrier F1 retombe sur la saison en cours, pour éviter d'envoyer une
 * valeur arbitraire à l'API.
 */
export function normalizeSeason(value?: string | null): string {
  const year = Number(value);
  if (!Number.isInteger(year)) return currentSeason();
  if (year < EARLIEST_SEASON || year > Number(currentSeason())) {
    return currentSeason();
  }
  return year.toString();
}
