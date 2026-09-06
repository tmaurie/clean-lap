import { SkeletonScreen } from "@/components/skeletons/PageSkeletons";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placé dans le groupe `(list)` — qui ne change pas l'URL — pour que la
 * frontière de chargement ne couvre **pas** `/drivers/[driverId]`, qui appelle
 * `notFound()`. Sinon le streaming renverrait 200 au lieu de 404.
 * Voir components/skeletons/README.md.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Chargement des pilotes">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-8 bg-primary/40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-12 w-64 sm:h-14" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-11 w-[300px]" />
            <Skeleton className="h-11 w-[190px]" />
            <Skeleton className="h-11 w-[150px]" />
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        <div className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 bg-background p-6">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}
