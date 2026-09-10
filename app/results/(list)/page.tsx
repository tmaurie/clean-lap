import type { Metadata } from "next";

import { SeasonsBrowser } from "@/app/results/SeasonsBrowser";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { getSeasonsWithRaceCount } from "@/features/results/hooks";
import { EARLIEST_SEASON, SEASONS_PAGE_SIZE } from "@/lib/api/seasonsPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Résultats — CleanLap",
  description:
    "Les résultats de Formule 1 saison par saison, de 1950 à aujourd'hui : vainqueurs, champions et classements de chaque manche.",
};

export default async function ResultsIndexPage() {
  // La première page était récupérée depuis le navigateur : la route arrivait
  // vide, puis se remplissait. Elle est désormais rendue côté serveur, où le
  // cache de fetch la mutualise entre tous les visiteurs.
  const seasons = await getSeasonsWithRaceCount(1, SEASONS_PAGE_SIZE).catch(
    (error: unknown) => {
      console.error("[results] première page indisponible", error);
      return [];
    },
  );

  const derniere = new Date().getFullYear();
  const total = derniere - EARLIEST_SEASON + 1;

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-2xl flex-col gap-5">
            {/* L'intitulé annonçait la couverture des seules saisons déjà
                chargées, donc un intervalle qui s'étendait au fil des clics.
                Il annonce maintenant l'archive complète, qui elle ne bouge
                pas. */}
            <SectionEyebrow>
              Archives — {EARLIEST_SEASON} à {derniere} · {total} saisons
            </SectionEyebrow>
            <h1 className="text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Résultats
            </h1>
            <p className="text-sm leading-relaxed text-foreground/55">
              Remontez le temps saison par saison. Champions pilotes et
              constructeurs en un coup d&apos;œil, résultats complets de chaque
              Grand Prix en un clic.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        {seasons.length === 0 ? (
          <div className="border border-dashed border-white/15 p-10 text-center text-sm leading-relaxed text-foreground/55">
            Les saisons sont momentanément indisponibles. Rechargez la page dans
            un instant.
          </div>
        ) : (
          <SeasonsBrowser initialSeasons={seasons} />
        )}
      </section>
    </div>
  );
}
