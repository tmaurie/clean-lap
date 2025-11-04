"use client";

import { useEffect, useMemo, useState } from "react";
import { getCalendar } from "@/features/calendar/getCalendar";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { ViewToggle } from "@/components/calendar/ViewToggle";
import { SectionCard } from "@/components/ui/section-card";
import { MiniRaceCard } from "@/components/calendar/MiniRaceCard";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getTimeUntilLabel, isPastRace } from "@/lib/utils/date";
import { Race } from "@/entities/race/model";
import {
  BadgeCheck,
  CalendarDays,
  Flag,
  Hourglass,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export function CalendarPageClient({ initialView }: { initialView: string }) {
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [races, setRaces] = useState<Race[]>([]);
  const [view, setView] = useState(initialView);

  useEffect(() => {
    getCalendar(season).then(setRaces);
  }, [season]);

  const sortedRaces = useMemo(
    () =>
      [...races].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [races],
  );

  const upcomingRace = useMemo(
    () =>
      sortedRaces.find((race) => new Date(race.date).getTime() >= Date.now()),
    [sortedRaces],
  );

  const completedRaces = useMemo(
    () => sortedRaces.filter((race) => isPastRace(race.date)),
    [sortedRaces],
  );

  const remainingRaces = useMemo(
    () => sortedRaces.filter((race) => !isPastRace(race.date)),
    [sortedRaces],
  );

  const racesByMonth = useMemo(() => {
    const groups = new Map<string, Race[]>();

    sortedRaces.forEach((race) => {
      const monthKey = new Date(race.date).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });

      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }

      groups.get(monthKey)!.push(race);
    });

    return Array.from(groups.entries()).map(([month, monthRaces]) => ({
      month,
      races: monthRaces,
    }));
  }, [sortedRaces]);

  const totalRaces = sortedRaces.length;
  const completedCount = completedRaces.length;
  const remainingCount = remainingRaces.length;

  const formatRaceDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Calendrier ${season}`}
        description="Liste complète des Grands Prix de la saison sélectionnée"
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle value={view} action={setView} />

            <SeasonSelect value={season} action={setSeason} />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard
          title="Vue d'ensemble"
          description="Résumé de la saison en cours"
          icon={<CalendarDays className="size-5" />}
          className="md:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Courses au total</p>
              <p className="text-2xl font-semibold">{totalRaces}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses disputées</p>
              <p className="text-2xl font-semibold">{completedCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses restantes</p>
              <p className="text-2xl font-semibold">{remainingCount}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Prochain Grand Prix"
          description={
            upcomingRace
              ? formatRaceDate(upcomingRace.date)
              : "En attente d’informations"
          }
          icon={<Hourglass className="size-5" />}
          className="bg-gradient-to-br from-primary/10 via-background to-background"
        >
          {upcomingRace ? (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {upcomingRace.location}
              </p>
              <p className="text-lg font-semibold">
                {countryToFlagEmoji(
                  upcomingRace.location.split(", ").at(-1) || "",
                )}{" "}
                {upcomingRace.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {upcomingRace.circuit}
              </p>
              <div className="flex items-center gap-2">
                {(() => {
                  const badge = getTimeUntilLabel(upcomingRace.date);

                  if (!badge) return null;

                  return (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
                <Link
                  href={`/calendar?view=timeline#${encodeURIComponent(
                    upcomingRace.name,
                  )}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Voir dans la frise →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Dès que les informations seront disponibles, elles apparaîtront
              ici.
            </p>
          )}
        </SectionCard>
      </div>

      {view === "list" && (
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Flag className="size-5 text-primary" /> Courses à venir
              </h3>
              <span className="text-sm text-muted-foreground">
                {remainingCount} course{remainingCount > 1 ? "s" : ""} restantes
              </span>
            </div>

            <div className="space-y-4">
              {remainingRaces.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aucune course restante pour cette saison.
                </p>
              )}
              {remainingRaces.map((race, index) => {
                const badge = getTimeUntilLabel(race.date);
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );

                return (
                  <SectionCard
                    key={`${race.name}-${race.date}`}
                    title={`${flag} ${race.name}`}
                    description={`${race.circuit} — ${formatRaceDate(race.date)}`}
                    actions={
                      badge && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      )
                    }
                    variant="subtle"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {race.location}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground/70">
                          Manche #{completedCount + index + 1}
                        </p>
                      </div>
                      <Link
                        href={`/calendar?view=grid#${encodeURIComponent(
                          race.name,
                        )}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Explorer le circuit →
                      </Link>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <BadgeCheck className="size-5 text-primary" /> Courses terminées
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedCount} course{completedCount > 1 ? "s" : ""} disputée
                {completedCount > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {completedRaces.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  La saison n'a pas encore commencé.
                </p>
              )}
              {completedRaces.map((race, index) => {
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );

                return (
                  <SectionCard
                    key={`${race.name}-${race.date}`}
                    title={`${flag} ${race.name}`}
                    description={`${race.circuit} — ${formatRaceDate(race.date)}`}
                    actions={
                      <Link
                        href={`/results/${new Date(race.date).getFullYear()}/${String(index + 1)}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Voir les résultats →
                      </Link>
                    }
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm text-muted-foreground">
                        {race.location}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                          Course disputée
                        </span>
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "grid" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedRaces.map((race, index) => (
            <div id={race.name} key={`${race.name}-${race.date}`}>
              <MiniRaceCard
                race={{
                  ...race,
                  round: String(index + 1),
                }}
              />
            </div>
          ))}
        </div>
      )}

      {view === "timeline" && (
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-8">
            {racesByMonth.map(({ month, races: monthRaces }) => (
              <div key={month} className="pl-10">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {month}
                  </p>
                </div>

                <div className="space-y-6">
                  {monthRaces.map((race) => {
                    const badge = getTimeUntilLabel(race.date);
                    const flag = countryToFlagEmoji(
                      race.location.split(", ").at(-1) || "",
                    );

                    return (
                      <div
                        key={`${race.name}-${race.date}`}
                        id={race.name}
                        className="relative rounded-lg border bg-card/40 p-4 shadow-sm"
                      >
                        <div className="absolute -left-10 top-5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                          ●
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <h4 className="text-base font-semibold">
                              {flag} {race.name}
                            </h4>
                            {badge && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {race.circuit} — {formatRaceDate(race.date)}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground/70">
                            {race.location}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
