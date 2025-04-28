"use client";

import { useRaceResults } from "@/features/race/useRaceResults";
import { getConstructorColor } from "@/components/ui/colors";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { AnimatedList } from "@/components/magicui/animated-list";

export function RaceResultsTable({
  season,
  round,
}: {
  season: string;
  round: string | "last";
  title?: string;
}) {
  const { data: results, isLoading, isError } = useRaceResults(season, round);
  const reversedResults = [...(results?.results || [])].reverse();

  const handleConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
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

  return (
    <div className="relative flex h-[300px] w-full flex-col overflow-hidden">
      <span className="text-sm font-semibold mb-2">{results.raceName}</span>
      <AnimatedList
        delay={500}
        className="flex-1 overflow-hidden overflow-y-scroll"
      >
        {reversedResults?.map((r, i) => {
          const isWinner = r.position === "1";

          return (
            <div
              key={i}
              className={`flex justify-between items-center text-sm border-b px-2 last:border-none ${
                isWinner ? "font-bold text-primary" : ""
              }`}
            >
              <div className="flex gap-2 items-center">
                <span className="w-5">{r.position}.</span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getConstructorColor(r.constructor),
                  }}
                />

                <span>{r.driver}</span>
                <div className="text-muted-foreground font-mono">
                  {r.constructor}
                </div>

                {isWinner && (
                  <Badge
                    onClick={handleConfetti}
                    className="text-xs bg-green-300 text-accent ml-2 animate-pulse cursor-pointer"
                  >
                    🏆 Vainqueur
                  </Badge>
                )}
              </div>

              <div className="text-xs text-right space-y-1">
                <div className="text-muted-foreground font-mono">{r.time}</div>
                <div className="text-sm font-semibold font-mono">
                  {r.points} pts
                </div>
              </div>
            </div>
          );
        })}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card to-transparent"></div>
    </div>
  );
}
