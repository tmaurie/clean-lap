import {
  RowsSkeleton,
  SkeletonScreen,
  TilesSkeleton,
} from "@/components/skeletons/PageSkeletons";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/standings` n'appelle jamais `notFound()` : un `loading.tsx` y est sans
 * risque pour le statut HTTP (voir components/skeletons/README.md).
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des classements">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-8 bg-primary/40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-12 w-80 sm:h-14" />
          </div>
          <Skeleton className="h-11 w-[140px]" />
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        <TilesSkeleton tiles={3} columns="md:grid-cols-3" />
        <RowsSkeleton rows={10} />
      </section>
    </SkeletonScreen>
  );
}
