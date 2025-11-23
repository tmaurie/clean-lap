"use client";

import Link from "next/link";
import { ArrowRight, ChartNoAxesColumn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConstructorStandings,
  useDriverStandings,
} from "@/features/standings/hooks";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StandingsPreviewProps = {
  driverLimit?: number;
  constructorLimit?: number;
};

export function StandingsPreview({
  driverLimit = 5,
  constructorLimit = 5,
}: StandingsPreviewProps) {
  const {
    data: driverStandings,
    isLoading: loadingDrivers,
    isError: errorDrivers,
  } = useDriverStandings("current");
  const {
    data: constructorStandings,
    isLoading: loadingConstructors,
    isError: errorConstructors,
  } = useConstructorStandings("current");

  if (loadingDrivers || loadingConstructors)
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );

  if (errorDrivers || errorConstructors)
    return <p>Classements indisponibles pour le moment.</p>;

  const drivers = (driverStandings ?? []).slice(0, driverLimit);
  const constructors = (constructorStandings ?? []).slice(0, constructorLimit);

  const maxDriverPoints = Math.max(
    ...drivers.map((driver) => Number(driver.points) || 0),
    1,
  );
  const maxConstructorPoints = Math.max(
    ...constructors.map((constructor) => Number(constructor.points) || 0),
    1,
  );

  return (
    <div className="space-y-6  ">
      <Tabs defaultValue="drivers">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="drivers">Pilotes</TabsTrigger>
          <TabsTrigger value="constructors">Écuries</TabsTrigger>
        </TabsList>
        <TabsContent value="drivers" className="space-y-3">
          <div className="flex items-baseline justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span>Pilotes</span>
            <span>Top {drivers.length}</span>
          </div>
          <ul className="space-y-2">
            {drivers.map((driver) => {
              const points = Number(driver.points) || 0;
              const wins = Number(driver.wins) || 0;
              const progress = Math.round((points / maxDriverPoints) * 100);
              const flag = countryToFlagEmoji(driver.nationality);
                const teamColor = getConstructorColor(driver.constructor);

              return (
                <li
                  key={`driver-${driver.position}`}
                  className="rounded-2xl border bg-card/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {driver.position}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium leading-tight">
                          {driver.driver}
                          {flag && (
                            <span className="ml-2 text-base">{flag}</span>
                          )}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: getConstructorColor(
                                driver.constructor,
                              ),
                            }}
                          />
                          {driver.constructor}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <span className="text-sm font-semibold text-foreground">
                        {points} pts
                      </span>
                      {wins > 0 && <span> · {wins} victoires</span>}
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                          className="h-full rounded-full"
                          style={{
                              width: `${progress}%`,
                              background: `linear-gradient(90deg, ${teamColor}, ${teamColor}aa, ${teamColor}55)`,
                          }}
                      />
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="constructors" className="space-y-3">
          <div className="flex items-baseline justify-between text-xs uppercase tracking-wide text-muted-foreground">
            <span>Constructeurs</span>
            <span>Top {constructors.length}</span>
          </div>
          <ul className="space-y-2">
            {constructors.map((constructor) => {
              const points = Number(constructor.points) || 0;
              const wins = Number(constructor.wins) || 0;
              const progress = Math.round(
                (points / maxConstructorPoints) * 100,
              );
              const teamColor = getConstructorColor(constructor.constructor);

              return (
                <li
                  key={`constructor-${constructor.position}`}
                  className="rounded-2xl border bg-card/60 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">
                        {constructor.position}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">
                          {constructor.constructor}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          {constructor.nationality}{" "}
                          {countryToFlagEmoji(constructor.nationality)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <span className="text-sm font-semibold text-foreground">
                        {points} pts
                      </span>
                      {wins > 0 && <span> · {wins} victoires</span>}
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${teamColor}, ${teamColor}aa, ${teamColor}55)`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/standings">
            <ChartNoAxesColumn className="h-4 w-4" aria-hidden />
            Voir les classements détaillés
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
