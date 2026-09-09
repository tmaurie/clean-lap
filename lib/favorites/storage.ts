/**
 * Favoris pilotes / écuries, persistés dans le navigateur.
 *
 * Écrit comme un store externe (`useSyncExternalStore`) plutôt qu'un `useState`
 * par composant : l'étoile d'une ligne de classement et le bloc « Mes favoris »
 * de la home doivent rester d'accord, et un second onglet aussi.
 */

export type FavoriteKind = "driver" | "team";

/** Clé versionnée : un changement de format n'écrasera pas l'ancienne. */
const STORAGE_KEY = "cleanlap.favorites.v1";

/**
 * Référence stable et partagée. `useSyncExternalStore` compare les snapshots
 * par identité : renvoyer un tableau neuf à chaque appel boucle à l'infini.
 */
const EMPTY: readonly string[] = Object.freeze([]);

let cache: readonly string[] | null = null;
const listeners = new Set<() => void>();

export function favoriteId(kind: FavoriteKind, id: string): string {
  return `${kind}:${id}`;
}

function isStorageAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readFromStorage(): readonly string[] {
  if (!isStorageAvailable()) return EMPTY;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    // Le contenu vient du disque de l'utilisateur : on ne fait confiance ni au
    // type ni à la forme. Tri pour que l'ordre d'affichage soit déterministe.
    const clean = parsed
      .filter((v): v is string => typeof v === "string" && v.includes(":"))
      .sort();

    return clean.length === 0 ? EMPTY : Object.freeze(clean);
  } catch {
    // Mode privé, quota, JSON corrompu : on repart d'une liste vide plutôt que
    // de casser la page.
    return EMPTY;
  }
}

function writeToStorage(next: readonly string[]): void {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Le quota peut refuser l'écriture. Le cache mémoire garde quand même la
    // sélection pour la session en cours.
  }
}

export function getFavoritesSnapshot(): readonly string[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

/**
 * Le rendu serveur ne connaît aucun favori. Renvoyer la même liste vide au
 * premier rendu client évite l'écart d'hydratation ; React relit ensuite.
 */
export function getServerFavoritesSnapshot(): readonly string[] {
  return EMPTY;
}

function emit(next: readonly string[]): void {
  cache = next.length === 0 ? EMPTY : Object.freeze([...next].sort());
  for (const listener of listeners) listener();
}

export function subscribeToFavorites(listener: () => void): () => void {
  listeners.add(listener);

  // Un autre onglet a pu changer la sélection.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    cache = readFromStorage();
    for (const l of listeners) l();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function toggleFavorite(id: string): void {
  const current = getFavoritesSnapshot();
  const next = current.includes(id)
    ? current.filter((entry) => entry !== id)
    : [...current, id];

  writeToStorage(next);
  emit(next);
}

/** Réinitialise le cache mémoire — pour les tests. */
export function resetFavoritesCache(): void {
  cache = null;
}
