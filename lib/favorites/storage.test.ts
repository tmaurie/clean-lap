import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  favoriteId,
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  resetFavoritesCache,
  subscribeToFavorites,
  toggleFavorite,
} from "./storage";

const KEY = "cleanlap.favorites.v1";

/**
 * Les tests tournent en environnement `node` (pas de DOM) : on pose un
 * `window` minimal plutôt que d'ajouter jsdom pour un seul module.
 */
function installWindow(overrides: Partial<Storage> = {}) {
  const store = new Map<string, string>();
  const handlers = new Set<(event: StorageEvent) => void>();

  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
    ...overrides,
  } as Storage;

  const fenetre = {
    localStorage,
    addEventListener: (type: string, h: (e: StorageEvent) => void) => {
      if (type === "storage") handlers.add(h);
    },
    removeEventListener: (type: string, h: (e: StorageEvent) => void) => {
      if (type === "storage") handlers.delete(h);
    },
  };

  vi.stubGlobal("window", fenetre);
  return {
    store,
    /** Simule un autre onglet qui a modifié la sélection. */
    emitStorageEvent: (key: string | null) => {
      for (const h of handlers) h({ key } as StorageEvent);
    },
  };
}

beforeEach(() => {
  resetFavoritesCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetFavoritesCache();
});

describe("favoriteId", () => {
  it("préfixe par le type pour qu'un pilote et une écurie homonymes ne se confondent pas", () => {
    expect(favoriteId("driver", "ferrari")).not.toBe(
      favoriteId("team", "ferrari"),
    );
  });
});

describe("storage", () => {
  it("part d'une sélection vide", () => {
    installWindow();
    expect(getFavoritesSnapshot()).toEqual([]);
  });

  it("ajoute puis retire", () => {
    installWindow();

    toggleFavorite("driver:leclerc");
    expect(getFavoritesSnapshot()).toEqual(["driver:leclerc"]);

    toggleFavorite("driver:leclerc");
    expect(getFavoritesSnapshot()).toEqual([]);
  });

  it("persiste dans localStorage", () => {
    const { store } = installWindow();

    toggleFavorite("team:ferrari");
    expect(JSON.parse(store.get(KEY) ?? "null")).toEqual(["team:ferrari"]);
  });

  it("relit une sélection existante et la trie", () => {
    const { store } = installWindow();
    store.set(KEY, JSON.stringify(["team:ferrari", "driver:leclerc"]));

    expect(getFavoritesSnapshot()).toEqual(["driver:leclerc", "team:ferrari"]);
  });

  it("renvoie la même référence tant que rien ne change", () => {
    // `useSyncExternalStore` compare les snapshots par identité : un tableau
    // neuf à chaque appel provoque une boucle de rendu infinie.
    installWindow();
    toggleFavorite("driver:norris");

    expect(getFavoritesSnapshot()).toBe(getFavoritesSnapshot());
  });

  it("ignore un contenu corrompu", () => {
    const { store } = installWindow();
    store.set(KEY, "{ pas du json");

    expect(getFavoritesSnapshot()).toEqual([]);
  });

  it("ignore les entrées qui ne sont pas des identifiants", () => {
    const { store } = installWindow();
    store.set(KEY, JSON.stringify(["driver:leclerc", 42, null, "sansprefixe"]));

    expect(getFavoritesSnapshot()).toEqual(["driver:leclerc"]);
  });

  it("ignore un contenu qui n'est pas un tableau", () => {
    const { store } = installWindow();
    store.set(KEY, JSON.stringify({ driver: "leclerc" }));

    expect(getFavoritesSnapshot()).toEqual([]);
  });

  it("prévient ses abonnés", () => {
    installWindow();
    const abonne = vi.fn();
    const desabonner = subscribeToFavorites(abonne);

    toggleFavorite("driver:piastri");
    expect(abonne).toHaveBeenCalledTimes(1);

    desabonner();
    toggleFavorite("driver:piastri");
    expect(abonne).toHaveBeenCalledTimes(1);
  });

  it("suit un changement venu d'un autre onglet", () => {
    const { store, emitStorageEvent } = installWindow();
    const abonne = vi.fn();
    subscribeToFavorites(abonne);

    store.set(KEY, JSON.stringify(["team:mclaren"]));
    emitStorageEvent(KEY);

    expect(getFavoritesSnapshot()).toEqual(["team:mclaren"]);
    expect(abonne).toHaveBeenCalledTimes(1);
  });

  it("ignore un événement portant sur une autre clé", () => {
    const { emitStorageEvent } = installWindow();
    const abonne = vi.fn();
    subscribeToFavorites(abonne);

    emitStorageEvent("autre-chose");
    expect(abonne).not.toHaveBeenCalled();
  });

  it("garde la sélection en mémoire quand l'écriture est refusée", () => {
    // Navigation privée ou quota dépassé : la page ne doit pas casser, et la
    // session en cours doit rester utilisable.
    installWindow({
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });

    expect(() => toggleFavorite("driver:hamilton")).not.toThrow();
    expect(getFavoritesSnapshot()).toEqual(["driver:hamilton"]);
  });

  it("ne connaît aucun favori côté serveur", () => {
    // Ce qui garantit que le premier rendu client est identique au serveur.
    expect(getServerFavoritesSnapshot()).toEqual([]);
  });

  it("sans window, ne tente rien et reste vide", () => {
    vi.stubGlobal("window", undefined);
    expect(getFavoritesSnapshot()).toEqual([]);
    expect(() => toggleFavorite("driver:alonso")).not.toThrow();
  });
});
