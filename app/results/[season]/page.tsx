import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { getRacesWithWinner } from "@/features/results/hooks";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { formatRaceDay } from "@/lib/utils/date";
import { EARLIEST_SEASON, currentSeason } from "@/lib/utils/season";

export const revalidate = 60;

type SeasonPageProps = {
  params: Promise<{ season: string }>;
};

/**
 * Les cinq dernières saisons sont pré-rendues au build : ce sont celles qu'on
 * consulte, et une saison close ne changera plus. Les autres restent générées
 * à la demande (`dynamicParams` par défaut), ce qui évite de payer au build
 * les ~4-5 s de f1api.dev pour les 77 saisons de l'histoire.
 */
export function generateStaticParams() {
  const current = Number(currentSeason());
  return Array.from({ length: 5 }, (_, i) => ({
    season: (current - i).toString(),
  }));
}

function parseSeason(value: string): number | null {
  const year = Number(value);
  if (!Number.isInteger(year)) return null;
  if (year < EARLIEST_SEASON || year > Number(currentSeason())) return null;
  return year;
}

export async function generateMetadata({
  params,
}: SeasonPageProps): Promise<Metadata> {
  const { season } = await params;
  if (parseSeason(season) === null) notFound();

  return {
    title: `Saison ${season} — Résultats | CleanLap`,
    description: `Toutes les manches de la saison ${season} de Formule 1, avec leur vainqueur et le lien vers le classement complet.`,
  };
}

const formatDate = (date: string) =>
  formatRaceDay(date, null, { day: "2-digit", month: "short" }) ?? date;

export default async function SeasonResultsPage({ params }: SeasonPageProps) {
  const { season } = await params;

  // Une année hors du calendrier F1 n'existe pas : vrai 404, comme la page
  // d'une manche inconnue.
  if (parseSeason(season) === null) notFound();

  // Une année valide dont l'API ne renvoie rien reste affichable : on montre
  // un état vide plutôt qu'une erreur.
  const races = await getRacesWithWinner(season).catch((error) => {
    console.warn(`[results] saison ${season} indisponible`, error);
    return [];
  });

  const completedRaces = races.filter((race) => Boolean(race.winner));
  const remainingRaces = races.filter((race) => !race.winner);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              Saison {season} — {completedRaces.length}/{races.length} disputées
            </SectionEyebrow>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Saison {season}
            </h1>
          </div>
        </div>
      </section>

      {races.length === 0 ? (
        <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            Aucune course n&apos;est disponible pour la saison {season}. Les
            données viennent d&apos;une API publique qui peut être momentanément
            indisponible.
          </p>
          <Link
            href="/results"
            className="inline-flex h-[52px] w-fit items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Choisir une autre saison →
          </Link>
        </section>
      ) : (
        <section className="flex flex-col gap-10 px-6 py-10 md:px-12">
          <div className="flex flex-col gap-4">
            <SectionEyebrow>Toutes les courses</SectionEyebrow>
            <div className="flex flex-col border-t border-border">
              {completedRaces.map((race) => {
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );
                const winnerColor = getConstructorColor(race.winnerTeam || "");
                return (
                  <div
                    key={race.round}
                    className="flex items-center gap-8 border-b border-border py-5 transition-colors hover:bg-[#12151a]"
                  >
                    <span className="w-[70px] text-3xl font-black italic text-foreground/40">
                      R{race.round}
                    </span>
                    <span className="w-8 text-2xl">{flag}</span>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[17px] font-extrabold uppercase tracking-wide">
                        {race.name}
                      </span>
                      <span className="text-xs text-foreground/50">
                        {race.circuit ? `${race.circuit} — ` : ""}
                        {race.location}
                      </span>
                    </div>
                    {race.winner && (
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-5 w-1"
                          style={{ background: winnerColor }}
                        />
                        <span className="text-[13px] font-semibold uppercase">
                          {race.winner}
                        </span>
                      </div>
                    )}
                    <span className="w-[100px] text-right font-mono text-[13px] text-foreground/50">
                      {formatDate(race.date)}
                    </span>
                    <Link
                      href={`/results/${season}/${race.round}`}
                      className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
                    >
                      Résultats →
                    </Link>
                  </div>
                );
              })}
              {remainingRaces.map((race) => {
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );
                return (
                  <div
                    key={race.round}
                    className="flex items-center gap-8 border-b border-border py-5 opacity-60"
                  >
                    <span className="w-[70px] text-3xl font-black italic text-foreground/40">
                      R{race.round}
                    </span>
                    <span className="w-8 text-2xl">{flag}</span>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-[17px] font-extrabold uppercase tracking-wide">
                        {race.name}
                      </span>
                      <span className="text-xs text-foreground/50">
                        {race.circuit ? `${race.circuit} — ` : ""}
                        {race.location}
                      </span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
                      En attente de départ
                    </span>
                    <span className="w-[100px] text-right font-mono text-[13px] text-foreground/50">
                      {formatDate(race.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
