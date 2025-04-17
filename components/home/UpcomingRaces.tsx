"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUpcomingRaces } from "@/features/upcomingRaces/useUpcomingRaces";
import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingRaces() {
  const { data: races, isLoading, isError } = useUpcomingRaces();

  if (isLoading)
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  if (isError || !races) return <p>Erreur lors du chargement.</p>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>📆 Prochaines courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {races.slice(1, 6).map((race, index) => (
          <div key={index} className="text-sm border-b pb-2">
            <p className="font-semibold">{race.name}</p>
            <p className="text-muted-foreground">{race.circuit}</p>
            <p className="text-xs">
              {new Date(race.date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}{" "}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
