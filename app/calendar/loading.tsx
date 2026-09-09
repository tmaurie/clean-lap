import {
  RowsSkeleton,
  SkeletonScreen,
} from "@/components/skeletons/PageSkeletons";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `/calendar` n'a pas de route enfant, donc cette frontière de chargement ne
 * couvre aucune page appelant `notFound()` — c'est la condition pour ne pas
 * transformer un 404 en 200. Voir components/skeletons/README.md.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Chargement du calendrier">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="h-[3px] w-8 bg-primary/40" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-11 w-[120px]" />
            </div>
            <Skeleton className="h-10 w-56 sm:h-14" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="grid w-full grid-cols-3 gap-px border border-white/8 bg-white/8 sm:flex sm:w-auto">
            {["Manches", "Disputées", "Restantes"].map((label) => (
              <div
                key={label}
                className="flex flex-col gap-2 bg-background px-3 py-3 sm:px-7 sm:py-4"
              >
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-10 px-6 py-10 md:px-12">
        <RowsSkeleton rows={8} />
      </section>
    </SkeletonScreen>
  );
}
