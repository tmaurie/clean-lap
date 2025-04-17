"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUpcomingRaces } from "@/features/upcomingRaces";

export function UpcomingRaces() {
  const { data: races, isLoading, isError } = useUpcomingRaces();

  if (isLoading) return <p>Chargement des prochaines courses...</p>;
  if (isError || !races) return <p>Erreur lors du chargement.</p>;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>📆 Prochaines courses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {races.slice(0, 10).map((race, index) => (
          <div key={index} className="text-sm border-b pb-2">
            <p className="font-semibold">{race.name}</p>
            <p className="text-muted-foreground">{race.circuit}</p>
            <p className="text-xs">
              {new Date(race.date).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
