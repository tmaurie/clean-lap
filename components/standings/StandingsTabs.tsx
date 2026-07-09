"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  useConstructorStandings,
  useDriverStandings,
} from "@/features/standings/hooks";
import { fetchRaces } from "@/lib/api/race";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { isPastRace } from "@/lib/utils/date";
import { GhostNumber } from "@/components/paddock/GhostNumber";

type StandingsTabsProps = {
  season: string;
};

export function StandingsTabs({ season }: StandingsTabsProps) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");

  const { data: drivers = [], isLoading: loadingDrivers } =
    useDriverStandings(season);
  const { data: constructors = [], isLoading: loadingConstructors } =
    useConstructorStandings(season);
  const { data: races = [] } = useQuery({
    queryKey: ["seasonRaces", season],
    queryFn: () => fetchRaces(season),
    enabled: !!season,
    staleTime: 1000 * 60 * 30,
  });

  const isDrivers = tab === "drivers";
  const isLoading = isDrivers ? loadingDrivers : loadingConstructors;
  const completedCount = races.filter((race) => isPastRace(race.date)).length;
  const remainingCount = Math.max(races.length - completedCount, 0);

  const rows = isDrivers
    ? drivers.map((d) => {
        const parts = d.driver.trim().split(" ");
        return {
          position: d.position,
          firstName: parts.slice(0, -1).join(" "),
          lastName: parts.at(-1) ?? d.driver,
          name: d.driver,
          secondary: d.constructor,
          flag: countryToFlagEmoji(d.nationality),
          points: Number(d.points) || 0,
          wins: d.wins,
          teamColor: getConstructorColor(d.constructor),
        };
      })
    : constructors.map((c) => ({
        position: c.position,
        firstName: "",
        lastName: c.constructor,
        name: c.constructor,
        secondary: c.nationality,
        flag: countryToFlagEmoji(c.nationality),
        points: Number(c.points) || 0,
        wins: c.wins,
        teamColor: getConstructorColor(c.constructor),
      }));

  const maxPoints = Math.max(...rows.map((r) => r.points), 1);
  const top3 = rows.slice(0, 3);
  const gap = rows.length >= 2 ? rows[0].points - rows[1].points : 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex gap-2 self-end">
        <button
          type="button"
          onClick={() => setTab("drivers")}
          className={cn(
            "border px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors",
            isDrivers
              ? "border-primary bg-primary text-primary-foreground"
              : "border-white/20 text-foreground/60 hover:text-foreground",
          )}
        >
          Pilotes
        </button>
        <button
          type="button"
          onClick={() => setTab("constructors")}
          className={cn(
            "border border-l-0 px-7 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors",
            !isDrivers
              ? "border-primary bg-primary text-primary-foreground"
              : "border-white/20 text-foreground/60 hover:text-foreground",
          )}
        >
          Écuries
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-foreground/50">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-foreground/50">
          Aucun classement disponible pour cette saison.
        </p>
      ) : (
        <>
          <div className="grid gap-px border border-white/8 bg-white/8 md:grid-cols-3">
            {top3.map((row, i) => (
              <div
                key={row.position}
                className="relative flex flex-col gap-4 overflow-hidden bg-background p-9"
              >
                <span
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: row.teamColor }}
                />
                <GhostNumber className="-bottom-6 -right-3 text-[160px]">
                  {row.position}
                </GhostNumber>
                <span
                  className="relative text-xs font-bold uppercase tracking-[0.2em]"
                  style={{
                    color: i === 0 ? "var(--primary)" : "rgba(244,244,242,0.5)",
                  }}
                >
                  P{row.position}
                </span>
                <div className="relative flex flex-col gap-1">
                  {row.firstName && (
                    <span className="text-[15px] text-foreground/60">
                      {row.firstName}
                    </span>
                  )}
                  <span className="text-3xl font-black italic uppercase leading-none tracking-tight">
                    {row.lastName}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 text-[13px] text-foreground/50">
                    <span
                      className="h-2.5 w-2.5"
                      style={{ background: row.teamColor }}
                    />
                    {row.secondary}
                  </span>
                </div>
                <div className="relative flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold leading-none">
                    {row.points}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/50">
                    points
                    {row.wins > 0
                      ? ` · ${row.wins} victoire${row.wins > 1 ? "s" : ""}`
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">
                {isDrivers
                  ? `Classement pilotes — ${rows.length} classés`
                  : `Classement constructeurs — ${rows.length} écuries`}
              </span>
              <span className="font-mono text-xs text-foreground/45">
                Écart P1→P2 : {gap} pts
                {races.length > 0 ? ` · ${remainingCount} GP restants` : ""}
              </span>
            </div>
            <div className="flex flex-col border-t border-border">
              {rows.map((row) => (
                <div
                  key={row.position}
                  className="flex items-center gap-7 border-b border-border p-4 transition-colors hover:bg-[#12151a]"
                >
                  <span className="w-14 text-2xl font-black italic text-foreground/30">
                    {row.position}
                  </span>
                  <span
                    className="h-9 w-1"
                    style={{ background: row.teamColor }}
                  />
                  <div className="flex w-[280px] flex-col gap-0.5">
                    <span className="text-[17px] font-extrabold uppercase tracking-wide">
                      {row.name}{" "}
                      <span className="text-[15px] font-normal">
                        {row.flag}
                      </span>
                    </span>
                    <span className="text-xs text-foreground/50">
                      {row.secondary}
                    </span>
                  </div>
                  <div className="h-1 flex-1 bg-white/7">
                    <div
                      className="h-1"
                      style={{
                        width: `${Math.round((row.points / maxPoints) * 100)}%`,
                        background: row.teamColor,
                      }}
                    />
                  </div>
                  <span className="w-[90px] text-right font-mono text-[13px] text-foreground/50">
                    {row.wins > 0
                      ? `${row.wins} victoire${row.wins > 1 ? "s" : ""}`
                      : "—"}
                  </span>
                  <span className="w-[90px] text-right text-xl font-extrabold">
                    {row.points}{" "}
                    <span className="text-[11px] font-semibold text-foreground/50">
                      PTS
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
