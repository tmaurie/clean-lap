"use client";

import { useUpcomingRaces } from "@/features/upcomingRaces/useUpcomingRaces";
import { Skeleton } from "@/components/ui/skeleton";
import { getTimeUntilLabel } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { clsx } from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowRight, ArrowUp, Calendar } from "lucide-react";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { useState } from "react";

export function UpcomingRaces() {
  const [expanded, setExpanded] = useState(false);

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
  const visibleRaces = expanded ? races.slice(1, 11) : races.slice(1, 6);

  return (
    <div className="space-y-4">
      {visibleRaces.map((race, i) => {
        const timeUntilLabel = getTimeUntilLabel(race.date);

        return (
          <div
            key={i}
            className="text-sm border-b pb-2 last:border-none flex justify-between items-center"
          >
            <div>
              <Badge variant="secondary" className="font-semibold">
                {countryToFlagEmoji(race.location.split(", ").at(-1) || "")}{" "}
                {race.name}
              </Badge>
              <p className="text-muted-foreground text-xs">{race.circuit}</p>
              <p className="text-xs md:hidden">
                {new Date(race.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
              </p>
            </div>

            {timeUntilLabel && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      className={clsx(
                        timeUntilLabel.className,
                        "text-xs",
                        "cursor-pointer",
                      )}
                    >
                      {timeUntilLabel.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {new Date(race.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      })}
      <div className="flex justify-between items-center">
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ArrowUp /> Réduire
            </>
          ) : (
            <>
              <ArrowDown /> Voir plus
            </>
          )}
        </Button>
        <Button hidden={!expanded} variant="outline" size="sm">
          <Calendar />
          <Link href="/calendar">Voir le calendrier complet</Link>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
