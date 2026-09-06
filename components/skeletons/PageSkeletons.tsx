import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Enveloppe commune à tous les écrans de chargement.
 *
 * Les barres grises sont purement décoratives (`aria-hidden`) : ce qui est
 * annoncé aux lecteurs d'écran, c'est le `role="status"` et son libellé. Sans
 * ça, une page en chargement est silencieuse pour un lecteur d'écran.
 */
export function SkeletonScreen({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>
      <div aria-hidden className="flex flex-col">
        {children}
      </div>
    </div>
  );
}

/** Reprend la structure du hero : filet + eyebrow, titre, ligne de méta. */
export function HeroSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <section className="border-b border-border px-6 py-14 md:px-12 md:py-16">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <span className="h-[3px] w-8 bg-primary/40" />
          <Skeleton className="h-3 w-56" />
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-12 sm:h-16",
                i === 0 ? "w-full max-w-3xl" : "w-2/3 max-w-xl",
              )}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </section>
  );
}

/** Lignes d'un tableau ou d'une liste, encadrées comme le rendu réel. */
export function RowsSkeleton({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-px border border-white/8 bg-white/8",
        className,
      )}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-5 bg-background px-5 py-4 sm:px-6"
        >
          <Skeleton className="h-6 w-7 shrink-0" />
          <Skeleton className="h-5 flex-1 max-w-[240px]" />
          <Skeleton className="ml-auto hidden h-4 w-32 sm:block" />
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Grille de statistiques ou de cartes (mêmes proportions que le rendu). */
export function TilesSkeleton({
  tiles = 4,
  columns = "sm:grid-cols-4",
}: {
  tiles?: number;
  columns?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px border border-white/8 bg-white/8",
        columns,
      )}
    >
      {Array.from({ length: tiles }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2.5 bg-background p-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Bloc de section : eyebrow + contenu. */
export function SectionSkeleton({
  children,
  eyebrowWidth = "w-40",
}: {
  children: React.ReactNode;
  eyebrowWidth?: string;
}) {
  return (
    <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
      <div className="flex items-center gap-3">
        <span className="h-[3px] w-8 bg-primary/40" />
        <Skeleton className={cn("h-3", eyebrowWidth)} />
      </div>
      {children}
    </section>
  );
}
