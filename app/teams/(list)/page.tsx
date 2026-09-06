import type { Metadata } from "next";
import Link from "next/link";

import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { fetchConstructorStandings } from "@/lib/api/standings";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { normalizeSeason } from "@/lib/utils/season";

export const revalidate = 60;

/** Première saison du championnat constructeurs. */
const FIRST_CONSTRUCTORS_SEASON = 1958;

export const metadata: Metadata = {
  title: "Écuries — CleanLap",
  description:
    "Les écuries de Formule 1 saison par saison : classement constructeurs, points et victoires.",
};

type TeamsPageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);

  // Le classement constructeurs est plus riche que `/api/{saison}/teams` :
  // il porte position, points et victoires en un seul appel.
  const teams = await fetchConstructorStandings(season).catch(() => []);
  const beforeChampionship = Number(season) < FIRST_CONSTRUCTORS_SEASON;

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              Saison {season} — {teams.length || "—"} écuries
            </SectionEyebrow>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Écuries
            </h1>
          </div>
          <SeasonUrlSelect value={season} triggerClassName="w-[140px] h-11" />
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        {teams.length === 0 ? (
          <div className="border border-dashed border-white/15 p-6 text-sm leading-relaxed text-foreground/55">
            {beforeChampionship
              ? `Le championnat du monde des constructeurs n'existe que depuis ${FIRST_CONSTRUCTORS_SEASON} : aucun classement d'écuries n'est disponible pour ${season}.`
              : `Aucune écurie enregistrée pour la saison ${season}.`}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const color = getConstructorColor(
                team.constructorId ?? team.constructor,
              );
              const href = team.constructorId
                ? `/teams/${team.constructorId}?season=${season}`
                : null;

              const card = (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className="text-2xl font-black italic"
                      style={{
                        color:
                          team.position === "1"
                            ? color
                            : "rgba(244,244,242,0.25)",
                      }}
                    >
                      {team.position}
                    </span>
                    <span className="text-xl">
                      {countryToFlagEmoji(team.nationality)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-1 shrink-0"
                      aria-hidden
                      style={{ background: color }}
                    />
                    <span className="text-base font-extrabold uppercase leading-tight tracking-wide">
                      {team.constructor}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-4 font-mono text-xs text-foreground/60">
                    <span>{team.points} pts</span>
                    {team.wins > 0 && (
                      <span>
                        {team.wins} victoire{team.wins > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </>
              );

              return (
                <li key={`${team.position}-${team.constructor}`}>
                  {href ? (
                    <Link
                      href={href}
                      className="flex h-full flex-col gap-3.5 bg-background p-6 transition-colors hover:bg-[#12151a]"
                    >
                      {card}
                    </Link>
                  ) : (
                    // Sans identifiant, pas de fiche à ouvrir : on affiche la
                    // carte sans lien plutôt qu'un lien mort.
                    <div className="flex h-full flex-col gap-3.5 bg-background p-6">
                      {card}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
