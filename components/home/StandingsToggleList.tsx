"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getConstructorColor } from "@/lib/utils/colors";
import type {
  ConstructorStanding,
  DriverStanding,
} from "@/entities/standings/model";

type Props = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
};

export function StandingsToggleList({ drivers, constructors }: Props) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");

  const rows =
    tab === "drivers"
      ? drivers.slice(0, 6).map((d) => ({
          position: d.position,
          name: d.driver,
          secondary: d.constructor,
          points: d.points,
          teamColor: getConstructorColor(d.constructor),
        }))
      : constructors.slice(0, 6).map((c) => ({
          position: c.position,
          name: c.constructor,
          secondary: c.nationality,
          points: c.points,
          teamColor: getConstructorColor(c.constructor),
        }));

  const maxPoints = Math.max(...rows.map((r) => Number(r.points) || 0), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("drivers")}
            className={cn(
              "border px-4 py-[7px] font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors",
              tab === "drivers"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/20 text-foreground/60 hover:text-foreground",
            )}
          >
            Pilotes
          </button>
          <button
            type="button"
            onClick={() => setTab("constructors")}
            className={cn(
              "border px-4 py-[7px] font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors",
              tab === "constructors"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/20 text-foreground/60 hover:text-foreground",
            )}
          >
            Écuries
          </button>
        </div>
        <Link
          href="/standings"
          className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
        >
          Classements →
        </Link>
      </div>

      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={`${tab}-${row.position}`}
            className="flex items-center gap-5 border-b border-border py-[13px]"
          >
            <span className="w-9 font-black italic text-2xl text-foreground/35">
              {row.position}
            </span>
            <span className="h-8 w-1" style={{ background: row.teamColor }} />
            <div className="flex flex-1 flex-col">
              <span className="text-[15px] font-bold uppercase tracking-wide">
                {row.name}
              </span>
              <span className="text-xs text-foreground/50">
                {row.secondary}
              </span>
            </div>
            <div className="flex w-[150px] flex-col items-end gap-1.5">
              <span className="text-[15px] font-extrabold">
                {row.points}{" "}
                <span className="text-[11px] font-semibold text-foreground/50">
                  PTS
                </span>
              </span>
              <div className="h-[3px] w-full bg-white/10">
                <div
                  className="h-[3px]"
                  style={{
                    width: `${Math.round((Number(row.points || 0) / maxPoints) * 100)}%`,
                    background: row.teamColor,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
