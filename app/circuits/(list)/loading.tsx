import { SkeletonScreen } from "@/components/skeletons/PageSkeletons";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Groupe `(list)` — sans effet sur l'URL — pour que la frontière de chargement
 * ne couvre pas `/circuits/[circuitId]`, qui appelle `notFound()`.
 * Voir components/skeletons/README.md.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des circuits">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-8 bg-primary/40" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-12 w-56 sm:h-14" />
          </div>
          <Skeleton className="h-11 w-[140px]" />
        </div>
      </section>
      <section className="px-6 py-10 md:px-12">
        <div className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3.5 bg-background p-6">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}
