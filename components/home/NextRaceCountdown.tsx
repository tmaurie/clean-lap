"use client";

import { MapPin, Clock, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNextRace } from "@/features/nextRace/useNextRace";
import { RaceCountdown } from "@/components/RaceCountdown";
import { Skeleton } from "@/components/ui/skeleton";
import { countryToFlagEmoji } from "@/lib/utils/flags";

export function NextRaceCountdown() {
  const { data: race, isLoading, isError } = useNextRace();

  if (isLoading)
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );

  if (isError || !race) return <p>Erreur lors du chargement.</p>;

  const raceDate = new Date(`${race.date}T${race.time}`);
  Math.floor((raceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span>
          <Badge>
            <strong>{race.circuit}</strong>
          </Badge>{" "}
          —{" "}
          <span className="font-mono">
            {race.location}{" "}
            {countryToFlagEmoji(race.location.split(", ").at(-1) || "")}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <span>
          Le{" "}
          {raceDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          à <Clock className="inline w-4 h-4 ml-1 mr-1 text-muted-foreground" />
          {raceDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <RaceCountdown date={race.date} time={race.time} />
    </div>
  );
}
