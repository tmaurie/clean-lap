"use client";

import Link from "next/link";

import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { useFavorites } from "@/features/favorites/useFavorites";
import type {
  ConstructorStanding,
  DriverStanding,
} from "@/entities/standings/model";
import { getConstructorColor } from "@/lib/utils/colors";
import type { FavoriteKind } from "@/lib/favorites/storage";

type Entree = {
  cle: string;
  kind: FavoriteKind;
  id: string;
  nom: string;
  href: string;
  couleur: string;
  position: string | null;
  points: string | null;
};

/**
 * Bloc « Mes favoris » de la home. Les favoris vivent dans le navigateur : le
 * rendu serveur n'en connaît aucun, ce composant n'affiche donc rien au premier
 * rendu puis apparaît après hydratation. Il est placé sous le pli pour que
 * cette apparition ne déplace pas le contenu qu'on est en train de lire.
 */
export function FavoritesBoard({
  season,
  drivers,
  constructors,
}: {
  season: string;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
}) {
  const { favorites } = useFavorites();
  if (favorites.length === 0) return null;

  const entrees: Entree[] = favorites.flatMap((cle): Entree[] => {
    const [kind, ...reste] = cle.split(":");
    const id = reste.join(":");
    if (!id || (kind !== "driver" && kind !== "team")) return [];

    if (kind === "driver") {
      const rang = drivers.find((d) => d.driverId === id);
      return [
        {
          cle,
          kind,
          id,
          nom: rang?.driver ?? id.replace(/[-_]/g, " "),
          href: `/drivers/${id}`,
          couleur: getConstructorColor(rang?.constructor ?? ""),
          position: rang?.position ?? null,
          points: rang?.points ?? null,
        },
      ];
    }

    const rang = constructors.find((c) => c.constructorId === id);
    return [
      {
        cle,
        kind,
        id,
        nom: rang?.constructor ?? id.replace(/[-_]/g, " "),
        href: `/teams/${id}?season=${season}`,
        couleur: getConstructorColor(id),
        position: rang?.position ?? null,
        points: rang?.points ?? null,
      },
    ];
  });

  return (
    <section className="flex flex-col gap-6 border-b border-border px-6 py-10 md:px-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <SectionEyebrow>Mes favoris</SectionEyebrow>
        <Link
          href="/standings"
          className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
        >
          Gérer depuis les classements →
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
        {entrees.map((entree) => (
          <li key={entree.cle}>
            <Link
              href={entree.href}
              className="flex h-full items-center gap-4 bg-background p-5 transition-colors hover:bg-[#12151a]"
            >
              <span
                className="h-10 w-1 shrink-0"
                aria-hidden
                style={{ background: entree.couleur }}
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[15px] font-extrabold uppercase tracking-wide">
                  {entree.nom}
                </span>
                <span className="text-xs text-foreground/55">
                  {entree.kind === "driver" ? "Pilote" : "Écurie"}
                </span>
              </div>
              <div className="ml-auto flex shrink-0 flex-col items-end gap-0.5">
                {entree.position ? (
                  <>
                    <span className="text-xl font-black italic">
                      P{entree.position}
                    </span>
                    <span className="font-mono text-xs text-foreground/55">
                      {entree.points} pts
                    </span>
                  </>
                ) : (
                  // Un pilote retiré ou une écurie absente cette saison : on le
                  // dit, plutôt que de faire disparaître le favori sans un mot.
                  <span className="text-right text-xs text-foreground/55">
                    Hors classement {season}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
