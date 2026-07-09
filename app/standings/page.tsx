"use client";

import { useState } from "react";

import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { StandingsTabs } from "@/components/standings/StandingsTabs";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";

export default function StandingsPage() {
  const [season, setSeason] = useState(new Date().getFullYear().toString());

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              Championnat du monde — Saison {season}
            </SectionEyebrow>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Classements
            </h1>
          </div>
          <SeasonSelect
            value={season}
            action={setSeason}
            triggerClassName="w-[140px] h-11"
          />
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        <StandingsTabs season={season} />
      </section>
    </div>
  );
}
