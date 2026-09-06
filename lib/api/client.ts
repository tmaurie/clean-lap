export const API_BASE_URL = "https://f1api.dev/api";

/**
 * f1api.dev répond en ~4-5 s. Le cache est donc la principale optimisation
 * possible, et les trois politiques ci-dessous dépendent de la volatilité
 * réelle de la donnée :
 *
 * - saison en cours : elle bouge chaque week-end de course → 60 s ;
 * - saison passée : immuable, plus rien ne changera → jamais revalidée ;
 * - donnée de référence sans saison (liste des pilotes, liste des saisons) :
 *   elle évolue quelques fois par an → 1 h.
 *
 * Ces options ne s'appliquent qu'au rendu serveur ; dans le navigateur elles
 * sont ignorées sans erreur, et c'est le cache HTTP qui prend le relais.
 */
const LIVE_SEASON_REVALIDATE = 60;
const REFERENCE_REVALIDATE = 3600;

export function isLiveSeason(season?: string): boolean {
  return season === "current" || season === new Date().getFullYear().toString();
}

function revalidateFor(season?: string): number | false {
  if (!season) return REFERENCE_REVALIDATE;
  return isLiveSeason(season) ? LIVE_SEASON_REVALIDATE : false;
}

export type FetchOptions = {
  /** Saison concernée : détermine la durée de cache. */
  season?: string;
  signal?: AbortSignal;
};

async function request(
  url: string,
  { season, signal }: FetchOptions = {},
): Promise<Response> {
  return fetch(url, {
    signal,
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateFor(season) },
  });
}

/**
 * `null` sur un 404 : chez f1api.dev, un 404 veut dire « ça n'existe pas »
 * (manche hors calendrier, séance jamais disputée). C'est une donnée, pas une
 * panne. Les autres codes d'erreur lèvent.
 */
export async function fetchApiOrNull<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<T | null> {
  const res = await request(url, options);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function fetchApi<T = unknown>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const json = await fetchApiOrNull<T>(url, options);
  if (json === null) {
    throw new Error(`Failed to fetch ${url}: 404 Not Found`);
  }
  return json;
}
