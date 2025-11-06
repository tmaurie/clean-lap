"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Flag as FlagIcon,
  MapPin,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getRacesWithWinner } from "@/features/results/hooks";
import { countryToFlagEmoji } from "@/lib/utils/flags";

type RaceWithWinner = {
  date: string;
  location: string;
  name: string;
  round: string;
  winner?: string | null;
};

function formatRaceDate(
  date: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export default function SeasonResultsPage({
  params,
}: {
  params: Promise<{ season: string }>;
}) {
  const { season } = React.use(params);
  const [races, setRaces] = useState<RaceWithWinner[] | null>(null);

  useEffect(() => {
    async function fetchRaces() {
      const data = await getRacesWithWinner(season);
      setRaces(data);
    }

    fetchRaces();
  }, [season]);

  const {
    completedRaces,
    highlightRace,
    highlightLabel,
    totalRaces,
    uniqueWinnerCount,
  } = useMemo(() => {
    if (!races || races.length === 0) {
      return {
        completedRaces: 0,
        highlightRace: undefined,
        highlightLabel: "",
        totalRaces: 0,
        uniqueWinnerCount: 0,
      } as const;
    }

    const finished = races.filter((race) => Boolean(race.winner));
    const upcoming = races.find((race) => !race.winner);
    const lastFinished = [...races].reverse().find((race) => race.winner);

    return {
      completedRaces: finished.length,
      highlightRace: upcoming ?? lastFinished,
      highlightLabel: upcoming ? "Prochaine course" : "Dernière course courue",
      totalRaces: races.length,
      uniqueWinnerCount: new Set(
        finished.map((race) => race.winner).filter(Boolean) as string[],
      ).size,
    } as const;
  }, [races]);

  if (!races) {
    return <div>Chargement des résultats...</div>;
  }

  if (races.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Saison ${season}`}
          description="Aucune course n'est encore disponible pour cette saison. Revenez bientôt !"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted/40 p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-[1.6fr_1fr] md:items-end">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Saison {season}</Badge>
              <span className="text-sm text-muted-foreground">
                {completedRaces} courses terminées sur {totalRaces}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Revivez chaque manche de la saison
              </h1>
              <p className="text-base text-muted-foreground sm:max-w-xl">
                Explorez les résultats course par course, découvrez les vainqueurs et replongez dans les moments forts de la saison {season}.
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary/10 bg-background/70 p-4 shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Courses disputées
                </dt>
                <dd className="mt-2 text-2xl font-semibold">
                  {completedRaces}
                  <span className="text-base font-medium text-muted-foreground">/{totalRaces}</span>
                </dd>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-background/70 p-4 shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vainqueurs différents
                </dt>
                <dd className="mt-2 text-2xl font-semibold">{uniqueWinnerCount}</dd>
              </div>
              <div className="rounded-2xl border border-primary/10 bg-background/70 p-4 shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Courses restantes
                </dt>
                <dd className="mt-2 text-2xl font-semibold">
                  {Math.max(totalRaces - completedRaces, 0)}
                </dd>
              </div>
            </dl>
          </div>

          {highlightRace && (
            <div className="rounded-2xl border border-primary/20 bg-background/80 p-6 shadow-md backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  {highlightLabel}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  Manche {highlightRace.round}
                </span>
              </div>
              <p className="mt-4 text-xl font-semibold">
                {countryToFlagEmoji(
                  highlightRace.location.split(", ").at(-1) || "",
                )}{" "}
                {highlightRace.name}
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  <span>
                    {formatRaceDate(highlightRace.date, {
                      weekday: "long",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{highlightRace.location}</span>
                </div>
                {highlightRace.winner && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Trophy className="size-4" />
                    <span>{highlightRace.winner}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <PageHeader
          title="Toutes les courses"
          description="Sélectionnez une course pour consulter les classements complets et les temps forts."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {races.map((race) => {
            const isCompleted = Boolean(race.winner);
            const flag = countryToFlagEmoji(
              race.location.split(", ").at(-1) || "",
            );

            return (
              <Link
                key={race.round}
                href={`/results/${season}/${race.round}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-lg">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <Badge variant="secondary">Manche {race.round}</Badge>
                      <Badge
                        variant={isCompleted ? "outline" : "secondary"}
                        className={
                          isCompleted
                            ? "text-foreground"
                            : "bg-primary/10 text-primary"
                        }
                      >
                        {isCompleted ? (
                          <>
                            <Trophy className="size-3.5" />
                            <span>Résultats</span>
                          </>
                        ) : (
                          <>
                            <CalendarDays className="size-3.5" />
                            <span>À venir</span>
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg sm:text-xl">
                        <span className="mr-2 text-xl">{flag}</span>
                        {race.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="size-3.5" />
                        <span>{race.location}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="size-4" />
                        Date
                      </span>
                      <span className="font-medium">
                        {formatRaceDate(race.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <FlagIcon className="size-4" />
                        Statut
                      </span>
                      <span className="font-medium">
                        {isCompleted ? `🏆 ${race.winner}` : "En attente de départ"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <span className="flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3">
                      Voir la course
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
