"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {ArrowRight, Calendar} from "lucide-react";

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
        {races.slice(1, 6).map((race, index) => {
          const timeUntilLabel = getTimeUntilLabel(race.date);

          return (
            <div
              key={index}
              className="text-sm border-b pb-2 last:border-none flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{race.name}</p>
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
        <div className="pt-4">
            <Button variant="secondary" size="sm" >
                <Calendar />
                <Link href="/calendar">Voir le calendrier complet</Link>
                <ArrowRight />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
