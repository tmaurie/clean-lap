import {
  HeroSkeleton,
  RowsSkeleton,
  SectionSkeleton,
  TilesSkeleton,
  SkeletonScreen,
} from "@/components/skeletons/PageSkeletons";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement du week-end de course">
      <HeroSkeleton />
      {/* Cinq lignes : le nombre de sessions d'un week-end classique. */}
      <SectionSkeleton eyebrowWidth="w-48">
        <RowsSkeleton rows={5} />
      </SectionSkeleton>
      <SectionSkeleton eyebrowWidth="w-24">
        <TilesSkeleton tiles={4} />
      </SectionSkeleton>
    </SkeletonScreen>
  );
}
