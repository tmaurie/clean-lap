"use client";

import Link from "next/link";
import confetti from "canvas-confetti";
import { ArrowRight, ChartLine, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRaceResults } from "@/features/race/useRaceResults";
import { cn } from "@/lib/utils";
import { getConstructorColor } from "@/lib/utils/colors";
import { nationalityToFlagEmoji } from "@/lib/utils/flags";

type RaceResultsTableProps = {
  season: string;
  round: string | "last";
  ctaHref?: string;
  ctaLabel?: string;
  limit?: number;
};

export function RaceResultsTable({
  season,
  round,
  ctaHref = "/results",
  ctaLabel = "Voir le résultat détaillé",
  limit = 5,
}: RaceResultsTableProps) {
  const { data: results, isLoading, isError } = useRaceResults(season, round);

  const handleConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  if (isLoading)
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  if (isError || !results) return <p>Erreur lors du chargement.</p>;

  const topResults = (results.results ?? []).slice(0, limit);
  const raceDate = results.date
    ? new Date(`${results.date}T${results.time ?? "00:00:00Z"}`)
    : null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {raceDate
            ? `${raceDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
              })} · ${results.location}`
            : results.location}
        </p>
        <p className="text-lg font-semibold leading-tight">
          {results.raceName}
        </p>
      </div>

      <div className="space-y-3">
        {topResults.length === 0 && (
          <div className="rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/20 p-4 text-sm text-muted-foreground">
            Les résultats ne sont pas encore disponibles.
          </div>
        )}

        {topResults.map((r) => {
          const isWinner = r.position === "1";
          const driverFlag = r.driverNationality
            ? nationalityToFlagEmoji(r.driverNationality)
            : "";

          return (
            <div
              key={`${results.raceName}-${r.position}`}
              className={cn(
                "relative flex items-center justify-between gap-4 rounded-2xl border bg-card/60 p-4",
                "transition-colors hover:border-primary/50",
                isWinner &&
                  "border-primary/60 bg-gradient-to-r from-primary/10 via-background to-background",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-muted font-semibold",
                    isWinner &&
                      "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                  )}
                >
                  {r.position}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight">
                    {r.driver}
                    {driverFlag && <span className="ml-2 text-base">{driverFlag}</span>}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getConstructorColor(r.constructor) }}
                    />
                    {r.constructor}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end text-xs text-muted-foreground">
                <span className="text-sm font-semibold text-foreground">
                  {r.points} pts
                </span>
                <span>{r.time}</span>
              </div>

              {isWinner && (
                <Badge
                  onClick={handleConfetti}
                  className="absolute -top-3 right-4 flex items-center gap-1 bg-primary text-primary-foreground shadow-sm"
                >
                  <Trophy className="h-3 w-3" aria-hidden />
                  Vainqueur
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href={ctaHref}>
            <ChartLine className="h-4 w-4" aria-hidden />
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
