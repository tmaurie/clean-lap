"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRaceResults } from "@/features/race/useRaceResults";

export function RaceResultsTable({
  round,
  title = "Résultats de course",
}: {
  round: number | "last";
  title?: string;
}) {
  const { data: results, isLoading, isError } = useRaceResults(round);

  if (isLoading) return <p>Chargement des résultats...</p>;
  if (isError || !results) return <p>Erreur lors du chargement.</p>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>🏁 {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.slice(0, 5).map((r, i) => (
          <div
            key={i}
            className="flex justify-between text-sm border-b pb-1 last:border-none"
          >
            <div className="flex gap-2">
              <span className="font-semibold w-6">{r.position}.</span>
              <span>{r.driver}</span>
            </div>
            <div className="text-muted-foreground text-xs">
              {r.constructor} • {r.time}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
