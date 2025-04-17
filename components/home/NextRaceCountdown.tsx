"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Clock, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNextRace } from "@/features/nextRace/useNextRace";
import { RaceCountdown } from "@/components/RaceCountdown";

export function NextRaceCountdown() {
  const { data: race, isLoading, isError } = useNextRace();

  if (isLoading) return <p>Chargement de la prochaine course...</p>;
  if (isError || !race) return <p>Erreur lors du chargement.</p>;

  const raceDate = new Date(`${race.date}T${race.time}`);
  const daysUntilRace = Math.floor(
    (raceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  const isThisWeekend = daysUntilRace <= 3;

  return (
    <Card className="h-full relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          🏁 Prochaine course
        </CardTitle>
        {isThisWeekend && <Badge variant="destructive">Ce week-end</Badge>}
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>
            <Badge>
              <strong>{race.circuit}</strong>
            </Badge>{" "}
            — {race.location}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span>
            Le {raceDate.toLocaleDateString("fr-FR")} à{" "}
            <Clock className="inline w-4 h-4 ml-1 mr-1 text-muted-foreground" />
            {raceDate.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <RaceCountdown date={race.date} time={race.time} />
      </CardContent>
    </Card>
  );
}
