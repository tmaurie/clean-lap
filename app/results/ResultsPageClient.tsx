"use client";

import Link from "next/link";
import { ArrowRight, Flag, Trophy } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Season } from "@/entities/season/model";
import { getConstructorColor } from "@/lib/utils/colors";
import { nationalityToFlagEmoji } from "@/lib/utils/flags";

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
      <div className="rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/10 p-10 text-center text-sm text-muted-foreground">
        Aucune saison n’est disponible pour le moment. Essayez de recharger la
        page.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
    ? nationalityToFlagEmoji(driverChampion.nationality)
    : null;
  const isCurrentSeason = season.season === new Date().getFullYear().toString();

  return (
    <Link
      href={`/results/${season.season}`}
      className="group block h-full"
      aria-label={`Voir les résultats de la saison ${season.season}`}
    >
      <Card className="relative h-full overflow-hidden border-primary/20 bg-card/80 backdrop-blur transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
        <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />

        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Badge
                variant="outline"
                className="w-fit border-primary/40 text-xs uppercase tracking-wide text-primary"
              >
                Saison
              </Badge>
              <CardTitle className="text-2xl font-semibold leading-tight">
                {season.season}
              </CardTitle>
              <CardDescription>{season.raceCount} Grand Prix</CardDescription>
            </div>
            {isCurrentSeason && (
              <Badge
                variant="secondary"
                className="border border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
              >
                Saison en cours
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 text-sm">
          <div className="flex items-center gap-3 rounded-xl border border-muted-foreground/20 bg-background/60 px-4 py-3">
            <Trophy className="h-4 w-4 text-primary" aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Champion pilote
              </p>
              <p className="font-medium text-foreground">
                {driverChampion ? (
                  <span>
                    {driverFlag} {driverChampion.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">À confirmer</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-dashed border-muted-foreground/20 bg-background/60 px-4 py-3">
            <Flag className="h-4 w-4 text-primary" aria-hidden />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Champion constructeur
              </p>
              {constructorChampion ? (
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: getConstructorColor(constructorChampion),
                    }}
                  />
                  <span className="font-medium text-foreground">
                    {constructorChampion}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">À confirmer</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm font-medium text-primary">
          <span>Consulter la saison</span>
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </CardFooter>
      </Card>
    </Link>
  );
}

function SeasonCardSkeleton() {
  return (
    <Card className="border-muted-foreground/20 bg-muted/10">
      <CardHeader className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-32" />
      </CardFooter>
    </Card>
  );
}
