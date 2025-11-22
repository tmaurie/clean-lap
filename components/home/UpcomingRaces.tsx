"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingRaces } from "@/features/upcomingRaces/useUpcomingRaces";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getTimeUntilLabel } from "@/lib/utils/date";

type UpcomingRacesProps = {
  limit?: number;
};

export function UpcomingRaces({ limit = 4 }: UpcomingRacesProps) {
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

  const upcomingRaces = races.slice(0, limit + 1);

  return (
    <div className="space-y-4">
      {upcomingRaces.map((race) => {
        const date = new Date(`${race.date}T${race.time || "00:00:00Z"}`);
        const isValidDate = !Number.isNaN(date.getTime());
        const day = isValidDate
          ? date.toLocaleDateString("fr-FR", { day: "2-digit" })
          : "--";
        const month = isValidDate
          ? date
              .toLocaleDateString("fr-FR", { month: "short" })
              .replace(".", "")
          : "";
        const country = race.location.split(", ").at(-1) || "";
        const timeUntil = getTimeUntilLabel(race.date);

        return (
          <div
            key={race.name}
            className="flex items-center justify-between gap-4 rounded-2xl border bg-card/60 p-4"
          >
            <div className="flex flex-1 flex-col gap-2">
              {timeUntil && (
                <Badge
                  className={`${timeUntil.className} self-start mb-2 text-xs`}
                >
                  {timeUntil.label}
                </Badge>
              )}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  <span>{day}</span>
                  <span className="text-[10px] uppercase tracking-wide text-primary/70">
                    {month}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium leading-tight">
                    {countryToFlagEmoji(country)} {race.name}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" aria-hidden />
                    {isValidDate
                      ? date.toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "long",
                        })
                      : race.date}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" aria-hidden />
                    {isValidDate
                      ? date.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                    · {race.circuit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/calendar">
            Voir le calendrier complet
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
