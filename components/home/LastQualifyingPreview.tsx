"use client";

import { useState } from "react";
import { CalendarClock, Flag, Timer } from "lucide-react";
import { clsx } from "clsx";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLastQualifying } from "@/features/qualifying/useLastQualifying";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LastQualifyingPreviewProps = {
  limit?: number;
};

function toUtcDateOnly(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function parseSessionDate(dateString?: string | null) {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ),
  );
}

export function LastQualifyingPreview({
  limit = 6,
}: LastQualifyingPreviewProps) {
  const { data, isLoading, isError } = useLastQualifying();
  const [open, setOpen] = useState(false);

  const sessionDate = parseSessionDate(data?.date);
  const today = toUtcDateOnly(new Date());
  const tomorrow = toUtcDateOnly(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const shouldDisplay =
    sessionDate &&
    (sessionDate.getTime() === today.getTime() ||
      sessionDate.getTime() === tomorrow.getTime());

  if (
    !isLoading &&
    (!shouldDisplay || !data || (data.results ?? []).length === 0)
  ) {
    return null;
  }

  if (isError) return null;

  const topResults = data?.results.slice(0, limit) ?? [];
  const raceFlag = data?.location
    ? countryToFlagEmoji(data.location.split(", ").at(-1) || "")
    : "";
  const bestTimes = data?.results[0]?.bestTimes;
  const formattedDate = sessionDate
    ? sessionDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const sessionDateTime =
    data?.date && data.time
      ? new Date(`${data.date}T${data.time}`)
      : data?.date
        ? new Date(`${data.date}T00:00:00Z`)
        : null;

  const formattedTime =
    sessionDateTime && data?.time
      ? sessionDateTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-background/80 backdrop-blur lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flag className="h-5 w-5 text-primary" aria-hidden />
            Qualifications du week-end
          </CardTitle>
          <CardDescription>
            Aperçu rapide de la grille de départ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-background/80 backdrop-blur lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flag className="h-5 w-5 text-primary" aria-hidden />
          Qualifications du week-end
        </CardTitle>
        <CardDescription>Aperçu rapide de la grille de départ</CardDescription>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {formattedDate && (
            <span className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" aria-hidden />
              {formattedDate}
            </span>
          )}
          {formattedTime && (
            <span className="flex items-center gap-2">
              <Timer className="h-4 w-4" aria-hidden />
              {formattedTime}
            </span>
          )}
          {data?.location && (
            <Badge variant="outline" className="border-primary/40 text-primary">
              {raceFlag && <span className="mr-2 text-base">{raceFlag}</span>}
              {data.location}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {topResults.map((q) => {
            const bestLap = q.q3 ?? q.q2 ?? q.q1 ?? "N/A";
            const driverFlag = q.driverNationality
              ? countryToFlagEmoji(q.driverNationality)
              : "";
            return (
              <div
                key={`${q.driver}-${q.position}`}
                className="flex items-center justify-between gap-4 rounded-2xl border bg-card/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">
                    {q.position}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-tight">
                      {q.driver}
                      {driverFlag && (
                        <span className="ml-2 text-base">{driverFlag}</span>
                      )}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: getConstructorColor(q.constructor),
                        }}
                      />
                      {q.constructor}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span className="text-sm font-mono text-foreground">
                    {bestLap}
                  </span>
                  <span className="uppercase tracking-wide">
                    Meilleur temps
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                Voir la grille complète
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl sm:max-w-4xl lg:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Résultats complets des qualifications</DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2">
                  {raceFlag && <span className="text-base">{raceFlag}</span>}
                  {data?.raceName} · {formattedDate ?? "Date inconnue"}
                  {formattedTime && (
                    <span className="ml-2 text-muted-foreground">
                      ({formattedTime})
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[70vh] space-y-3 overflow-y-auto">
                {data?.results.map((q) => (
                  <div
                    key={`${q.driver}-${q.position}`}
                    className="grid gap-3 rounded-2xl border bg-card/60 p-4 md:grid-cols-[auto_1fr_auto]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">
                        {q.position}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight">
                          {q.driver}
                          {q.driverNationality && (
                            <span className="ml-2 text-base">
                              {countryToFlagEmoji(q.driverNationality)}
                            </span>
                          )}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: getConstructorColor(
                                q.constructor,
                              ),
                            }}
                          />
                          {q.constructor}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap  items-center gap-3 text-xs text-muted-foreground md:justify-center">
                      {["q1", "q2", "q3"].map((session) => {
                        const time = q[session as "q1" | "q2" | "q3"];
                        const isBest =
                          bestTimes &&
                          bestTimes[session as "q1" | "q2" | "q3"] !== null &&
                          bestTimes[session as "q1" | "q2" | "q3"] !==
                            undefined &&
                          time?.replace(/[:.]/g, "") ===
                            String(bestTimes[session as "q1" | "q2" | "q3"]);
                        return (
                          <span
                            key={session}
                            className={clsx(
                              "font-mono",
                              isBest && "text-purple-500 font-semibold",
                            )}
                          >
                            {session.toUpperCase()}: {time ?? "N/A"}
                          </span>
                        );
                      })}
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      <span className="text-sm font-mono text-foreground">
                        {q.q3 ?? q.q2 ?? q.q1 ?? "N/A"}
                      </span>
                      <div>Meilleur temps</div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
