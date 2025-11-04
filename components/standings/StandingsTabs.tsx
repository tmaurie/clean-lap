"use client";

import { clsx } from "clsx";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConstructorStandings,
  useDriverStandings,
} from "@/features/standings/hooks";
import { getConstructorColor } from "@/lib/utils/colors";
import { nationalityToFlagEmoji } from "@/lib/utils/flags";

type StandingsTabsProps = {
  season: string;
  compact?: boolean;
};

export function StandingsTabs({ season, compact = false }: StandingsTabsProps) {
  const {
    data: drivers,
    isLoading: loadingDrivers,
    isError: driverError,
  } = useDriverStandings(season);
  const {
    data: constructors,
    isLoading: loadingConstructors,
    isError: constructorError,
  } = useConstructorStandings(season);

  const limit = compact ? 5 : undefined;
  const driverStandings = (drivers ?? []).slice(0, limit);
  const constructorStandings = (constructors ?? []).slice(0, limit);
  const placeholderCount = Math.min(limit ?? 10, 10);

  const driverPoints = driverStandings.map((driver) => Number(driver.points) || 0);
  const constructorPoints = constructorStandings.map(
    (constructor) => Number(constructor.points) || 0,
  );

  const maxDriverPoints = driverPoints.length > 0 ? Math.max(...driverPoints) : 1;
  const maxConstructorPoints =
    constructorPoints.length > 0 ? Math.max(...constructorPoints) : 1;

  return (
    <Tabs
      defaultValue="drivers"
      className={clsx("w-full", compact ? "gap-3" : "gap-6")}
    >
      <TabsList
        className={clsx(
          "grid w-full grid-cols-2 bg-muted/60",
          compact ? "h-9 rounded-lg" : "h-11 rounded-2xl",
        )}
      >
        <TabsTrigger className="text-sm" value="drivers">
          Pilotes
        </TabsTrigger>
        <TabsTrigger className="text-sm" value="constructors">
          Écuries
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="drivers"
        className={clsx("space-y-4", compact ? "mt-3" : "mt-6")}
      >
        {loadingDrivers ? (
          <LoadingStandingsList compact={compact} count={placeholderCount} />
        ) : driverError ? (
          <EmptyState message="Impossible de charger le classement pilotes pour le moment." />
        ) : driverStandings.length === 0 ? (
          <EmptyState message="Aucun classement pilote disponible pour cette saison." />
        ) : (
          <ul className="space-y-3">
            {driverStandings.map((driver) => {
              const points = Number(driver.points) || 0;
              const wins = Number(driver.wins) || 0;
              const progress = Math.round((points / maxDriverPoints) * 100);
              const flag = nationalityToFlagEmoji(driver.nationality);

              return (
                <li key={`driver-${driver.position}`}>
                  <StandingsCard
                    compact={compact}
                    label={driver.driver}
                    secondaryLabel={driver.constructor}
                    position={driver.position}
                    points={points}
                    wins={wins}
                    flag={flag}
                    accentColor={getConstructorColor(driver.constructor)}
                    progress={progress}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </TabsContent>

      <TabsContent
        value="constructors"
        className={clsx("space-y-4", compact ? "mt-3" : "mt-6")}
      >
        {loadingConstructors ? (
          <LoadingStandingsList compact={compact} count={placeholderCount} />
        ) : constructorError ? (
          <EmptyState message="Impossible de charger le classement constructeurs pour le moment." />
        ) : constructorStandings.length === 0 ? (
          <EmptyState message="Aucun classement constructeur disponible pour cette saison." />
        ) : (
          <ul className="space-y-3">
            {constructorStandings.map((constructor) => {
              const points = Number(constructor.points) || 0;
              const wins = Number(constructor.wins) || 0;
              const progress = Math.round(
                (points / maxConstructorPoints) * 100,
              );

              return (
                <li key={`constructor-${constructor.position}`}>
                  <StandingsCard
                    compact={compact}
                    label={constructor.constructor}
                    secondaryLabel={constructor.nationality}
                    position={constructor.position}
                    points={points}
                    wins={wins}
                    accentColor={getConstructorColor(constructor.constructor)}
                    progress={progress}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}

type StandingsCardProps = {
  compact?: boolean;
  label: string;
  secondaryLabel?: string;
  position: string;
  points: number;
  wins: number;
  flag?: string;
  accentColor: string;
  progress: number;
};

function StandingsCard({
  compact,
  label,
  secondaryLabel,
  position,
  points,
  wins,
  flag,
  accentColor,
  progress,
}: StandingsCardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md",
        compact ? "space-y-3 text-xs" : "space-y-4 text-sm",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary",
              compact && "h-8 w-8 text-xs",
            )}
          >
            {position}
          </div>
          <div className="space-y-1">
            <p
              className={clsx(
                "flex items-center gap-2 font-medium leading-tight text-foreground",
                compact ? "text-sm" : "text-base",
              )}
            >
              <span>{label}</span>
              {flag && <span className="text-lg">{flag}</span>}
            </p>
            {secondaryLabel && (
              <p
                className={clsx(
                  "flex items-center gap-2 text-muted-foreground",
                  compact ? "text-[11px]" : "text-xs",
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                {secondaryLabel}
              </p>
            )}
          </div>
        </div>

        <div
          className={clsx(
            "text-right text-muted-foreground",
            compact ? "text-[11px]" : "text-xs",
          )}
        >
          <span
            className={clsx(
              "font-semibold text-foreground",
              compact ? "text-sm" : "text-base",
            )}
          >
            {points} pts
          </span>
          {wins > 0 && <span> · {wins} victoires</span>}
        </div>
      </div>

      <div
        className={clsx(
          "h-1.5 overflow-hidden rounded-full bg-muted",
          compact && "h-1",
        )}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function LoadingStandingsList({
  count,
  compact,
}: {
  count: number;
  compact?: boolean;
}) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <li key={`skeleton-${index}`}>
          <div
            className={clsx(
              "rounded-2xl border border-border/50 bg-background/60 p-4",
              compact ? "space-y-3" : "space-y-4",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-background/40 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
