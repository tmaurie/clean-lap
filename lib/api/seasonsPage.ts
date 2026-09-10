export const SEASONS_PAGE_SIZE = 12;
export const EARLIEST_SEASON = 1950;

/** Nombre total de pages, du plus récent au plus ancien. */
export function seasonsPageCount(now: Date = new Date()): number {
  const total = now.getFullYear() - EARLIEST_SEASON + 1;
  return Math.max(1, Math.ceil(total / SEASONS_PAGE_SIZE));
}

/**
 * Normalise le paramètre `page` venu de l'URL. `null` signifie « refuser » :
 * le handler renvoie alors un 400 plutôt que d'aller chercher des années qui
 * n'existent pas.
 */
export function parseSeasonsPage(
  raw: string | null,
  now: Date = new Date(),
): number | null {
  if (raw === null) return 1;

  // `Number("")` vaut 0 et `Number(" 2 ")` vaut 2 : on exige des chiffres.
  if (!/^\d+$/.test(raw)) return null;

  const page = Number(raw);
  if (page < 1 || page > seasonsPageCount(now)) return null;
  return page;
}

/**
 * La première page contient la saison en cours, qui bouge chaque week-end ;
 * les suivantes ne contiennent que des saisons closes, définitivement figées.
 */
export function seasonsCacheControl(page: number): string {
  return page === 1
    ? "public, s-maxage=60, stale-while-revalidate=3600"
    : "public, s-maxage=3600, stale-while-revalidate=86400";
}
