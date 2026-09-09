"use client";

import { useFavorites } from "@/features/favorites/useFavorites";
import type { FavoriteKind } from "@/lib/favorites/storage";
import { cn } from "@/lib/utils";

/**
 * Bascule « favori » pour un pilote ou une écurie.
 *
 * Le libellé accessible ne change pas d'un état à l'autre : c'est `aria-pressed`
 * qui porte l'état, comme le veut le motif du bouton bascule. Et l'étoile garde
 * la même taille pleine ou vide, pour que la ligne ne bouge pas au clic.
 */
export function FavoriteButton({
  kind,
  id,
  name,
  className,
  size = "sm",
}: {
  kind: FavoriteKind;
  id: string;
  /** Nom affiché, repris dans le libellé accessible. */
  name: string;
  className?: string;
  size?: "sm" | "lg";
}) {
  const { isFavorite, toggle } = useFavorites();
  const actif = isFavorite(kind, id);

  return (
    <button
      type="button"
      aria-pressed={actif}
      aria-label={`${name} en favori`}
      title={actif ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={() => toggle(kind, id)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition-colors",
        size === "lg" ? "h-11 w-11" : "h-8 w-8",
        actif
          ? "text-primary hover:text-primary/80"
          : "text-foreground/55 hover:text-foreground",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]"}
        fill={actif ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={actif ? 0 : 1.8}
        strokeLinejoin="round"
      >
        <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.45 6.2 20.5l1.1-6.47L2.6 9.45l6.5-.95L12 2.6z" />
      </svg>
    </button>
  );
}
