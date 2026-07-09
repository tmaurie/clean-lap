"use client";

import Link from "next/link";

import { Season } from "@/entities/season/model";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { GhostNumber } from "@/components/paddock/GhostNumber";

type ResultsPageClientProps = {
  seasons: Season[];
  isLoading: boolean;
  isInitialLoading: boolean;
};

export function ResultsPageClient({
  seasons,
  isLoading,
  isInitialLoading,
}: ResultsPageClientProps) {
  const skeletonCount = isInitialLoading ? 6 : isLoading ? 3 : 0;
  const showGrid = seasons.length > 0 || skeletonCount > 0;

  if (!showGrid) {
    return (
      <div className="border border-dashed border-white/15 p-10 text-center text-sm text-foreground/50">
        Aucune saison n&apos;est disponible pour le moment. Essayez de recharger
        la page.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
      {seasons.map((season) => (
        <SeasonCard key={season.season} season={season} />
      ))}
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <SeasonCardSkeleton key={`season-skeleton-${index}`} />
      ))}
    </div>
  );
}

function SeasonCard({ season }: { season: Season }) {
  const driverChampion = season.driverChampion;
  const constructorChampion = season.constructorChampion;
  const driverFlag = driverChampion
    ? countryToFlagEmoji(driverChampion.nationality)
    : null;
  const isCurrentSeason = season.season === new Date().getFullYear().toString();

  return (
    <Link
      href={`/results/${season.season}`}
      className="block h-full"
      aria-label={`Voir les résultats de la saison ${season.season}`}
    >
      <div
        className="relative flex h-full flex-col gap-6 overflow-hidden p-7 transition-colors"
        style={{
          background: isCurrentSeason ? "#12151a" : "var(--background)",
        }}
      >
        <GhostNumber className="-top-2 right-[-16px] text-[150px]">
          &apos;{season.season.slice(2)}
        </GhostNumber>
        <div className="relative flex items-center justify-between">
          <span className="text-4xl font-black italic leading-none tracking-tight">
            {season.season}
          </span>
          {isCurrentSeason && (
            <span className="bg-primary px-3 py-[5px] text-[11px] font-extrabold italic uppercase tracking-[0.1em] text-primary-foreground">
              En cours
            </span>
          )}
        </div>

        <div className="relative flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/45">
              Champion pilote
            </span>
            <span
              className={
                "text-base font-extrabold uppercase " +
                (driverChampion ? "" : "text-foreground/40")
              }
            >
              {driverChampion
                ? `${driverFlag ?? ""} ${driverChampion.name}`
                : "À décider"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/45">
              Champion constructeur
            </span>
            <span
              className={
                "flex items-center gap-2 text-base font-extrabold uppercase " +
                (constructorChampion ? "" : "text-foreground/40")
              }
            >
              {constructorChampion && (
                <span
                  className="h-2.5 w-2.5"
                  style={{
                    background: getConstructorColor(constructorChampion),
                  }}
                />
              )}
              {constructorChampion ?? "À décider"}
            </span>
          </div>
        </div>

        <div className="relative mt-auto flex items-center justify-between border-t border-border pt-4">
          <span className="font-mono text-xs text-foreground/55">
            {season.raceCount} Grands Prix
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
            Consulter →
          </span>
        </div>
      </div>
    </Link>
  );
}

function SeasonCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 bg-background p-7">
      <div className="h-8 w-20 animate-pulse bg-white/10" />
      <div className="h-4 w-32 animate-pulse bg-white/10" />
      <div className="h-4 w-40 animate-pulse bg-white/10" />
      <div className="mt-auto h-4 w-24 animate-pulse bg-white/10" />
    </div>
  );
}
