import type { Metadata } from "next";

import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { StandingsTabs } from "@/components/standings/StandingsTabs";
import { fetchRaces } from "@/lib/api/race";
import {
  fetchConstructorStandings,
  fetchDriverStandings,
} from "@/lib/api/standings";
import { normalizeSeason } from "@/lib/utils/season";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Classements — CleanLap",
  description:
    "Classement pilotes et constructeurs du championnat du monde de Formule 1, saison par saison.",
};

type StandingsPageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function StandingsPage({
  searchParams,
}: StandingsPageProps) {
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);

  // Les trois appels étaient faits depuis le navigateur (React Query). Côté
  // serveur, ils sont mutualisés et servis par le cache de fetch — et la page
  // n'embarque plus le client React Query.
  const [drivers, constructors, races] = await Promise.all([
    fetchDriverStandings(season).catch(() => []),
    fetchConstructorStandings(season).catch(() => []),
    fetchRaces(season).catch(() => []),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              Championnat du monde — Saison {season}
            </SectionEyebrow>
            <h1 className="text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Classements
            </h1>
          </div>
          <SeasonUrlSelect value={season} triggerClassName="w-[140px] h-11" />
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        <StandingsTabs
          season={season}
          drivers={drivers}
          constructors={constructors}
          races={races}
        />
      </section>
    </div>
  );
}
