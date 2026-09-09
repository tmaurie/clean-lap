"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  favoriteId,
  getFavoritesSnapshot,
  getServerFavoritesSnapshot,
  subscribeToFavorites,
  toggleFavorite,
  type FavoriteKind,
} from "@/lib/favorites/storage";

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getServerFavoritesSnapshot,
  );

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string) =>
      favorites.includes(favoriteId(kind, id)),
    [favorites],
  );

  const toggle = useCallback(
    (kind: FavoriteKind, id: string) => toggleFavorite(favoriteId(kind, id)),
    [],
  );

  return { favorites, isFavorite, toggle };
}
