"use client";

import Link from "next/link";

import { Driver } from "@/entities/driver/model";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getConstructorColor } from "@/lib/utils/colors";
import { GhostNumber } from "@/components/paddock/GhostNumber";

type DriverCardProps = {
  driver: Driver;
};

export function DriverCard({ driver }: DriverCardProps) {
  const flag = driver.nationality ? countryToFlagEmoji(driver.nationality) : "";
  const teamColor = getConstructorColor(driver.teamId || "");
  const number = driver.number ?? "–";
  const parts = `${driver.name} ${driver.surname}`.trim().split(" ");
  const lastName = parts.at(-1) ?? driver.surname;
  const firstName = parts.slice(0, -1).join(" ") || driver.name;

  return (
    <Link href={`/drivers/${driver.id}`} className="block h-full">
      <div className="relative flex h-full flex-col gap-5 overflow-hidden bg-background p-6 pt-7 transition-colors hover:bg-[#12151a]">
        <span
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: teamColor }}
        />
        <GhostNumber className="right-[-8px] top-2 text-[96px]">
          {number}
        </GhostNumber>
        <div className="relative flex items-center justify-between">
          <span
            className="text-2xl font-black italic"
            style={{ color: teamColor }}
          >
            {number}
          </span>
          <span className="text-xl">{flag}</span>
        </div>
        <div className="relative flex flex-col gap-1">
          <span className="text-[13px] font-medium text-foreground/60">
            {firstName}
          </span>
          <span className="text-[22px] font-extrabold uppercase leading-none tracking-wide">
            {lastName}
          </span>
          <span className="mt-1.5 flex items-center gap-2 text-xs text-foreground/50">
            <span className="h-2 w-2" style={{ background: teamColor }} />
            {driver.teamId || "Équipe inconnue"}
          </span>
        </div>
        <div className="relative flex items-center justify-between border-t border-border pt-3.5">
          <span className="font-mono text-xs text-foreground/55">
            {driver.nationality ?? "N/A"}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
            Profil →
          </span>
        </div>
      </div>
    </Link>
  );
}
