"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRaceResults } from "@/features/race/useRaceResults";
import { getConstructorColor } from "@/components/ui/colors";
import { Skeleton } from "@/components/ui/skeleton";

export function RaceResultsTable({
  round,
  title = "Résultats de course",
}: {
  round: number | "last";
  title?: string;
}) {
  const { data: results, isLoading, isError } = useRaceResults(round);

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>🏁 {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.slice(0, 5).map((r, i) => {
          const isWinner = r.position === "1";

          return (
            <div
              key={i}
              className={`flex justify-between items-center text-sm border-b pb-1 last:border-none ${
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
                {isWinner && (
                  <span className="text-xs text-green-500 ml-2 animate-pulse">
                    🏆 Vainqueur
                  </span>
                )}
              </div>

              <div className="text-xs text-right space-y-1">
                <div className="text-muted-foreground">{r.constructor}</div>
                <div className="text-muted-foreground">{r.time}</div>
                <div className="text-sm font-semibold">{r.points} pts</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
