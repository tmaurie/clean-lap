import type { Metadata } from "next";
import Link from "next/link";

import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { fetchCircuitsForSeason } from "@/lib/api/circuits";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { normalizeSeason } from "@/lib/utils/season";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Circuits — CleanLap",
  description:
    "Les circuits du calendrier de Formule 1 : longueur, nombre de virages, record du tour et première édition.",
};

type CircuitsPageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function CircuitsPage({
  searchParams,
}: CircuitsPageProps) {
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);
  const circuits = await fetchCircuitsForSeason(season);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              Saison {season} — {circuits.length || "—"} circuits
            </SectionEyebrow>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Circuits
            </h1>
          </div>
          <SeasonUrlSelect value={season} triggerClassName="w-[140px] h-11" />
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        {circuits.length === 0 ? (
          <div className="border border-dashed border-white/15 p-6 text-sm leading-relaxed text-foreground/55">
            Aucun circuit enregistré pour la saison {season}.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
            {circuits.map((circuit) => (
              <li key={circuit.id}>
                <Link
                  href={`/circuits/${circuit.id}?season=${season}`}
                  className="flex h-full flex-col gap-3.5 bg-background p-6 transition-colors hover:bg-[#12151a]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                      {circuit.city ?? circuit.country ?? "—"}
                    </span>
                    <span className="text-xl">
                      {countryToFlagEmoji(circuit.country ?? "")}
                    </span>
                  </div>

                  <span className="text-base font-extrabold uppercase leading-tight tracking-wide">
                    {circuit.name}
                  </span>

                  <div className="mt-auto flex flex-wrap items-center gap-4 font-mono text-xs text-foreground/60">
                    {circuit.lengthMeters !== null && (
                      <span>{(circuit.lengthMeters / 1000).toFixed(3)} km</span>
                    )}
                    {circuit.corners !== null && (
                      <span>{circuit.corners} virages</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
