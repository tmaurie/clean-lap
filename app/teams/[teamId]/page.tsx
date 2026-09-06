import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GhostNumber } from "@/components/paddock/GhostNumber";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { SeasonUrlSelect } from "@/components/calendar/SeasonUrlSelect";
import { fetchTeamSeason } from "@/lib/api/teams";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { normalizeSeason } from "@/lib/utils/season";

export const revalidate = 60;

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ season?: string }>;
};

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const team = await fetchTeamSeason(teamId, normalizeSeason(undefined));

  if (!team) notFound();

  return {
    title: `${team.team.name} — CleanLap`,
    description: `Effectif, classement et palmarès de ${team.team.name} en Formule 1.`,
  };
}

export default async function TeamPage({
  params,
  searchParams,
}: TeamPageProps) {
  const { teamId } = await params;
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);

  const data = await fetchTeamSeason(teamId, season);
  if (!data) notFound();

  const { team, standing, lineup } = data;
  const color = getConstructorColor(team.id);
  const flag = team.nationality ? countryToFlagEmoji(team.nationality) : "";

  const palmares = [
    { label: "Titres constructeurs", value: team.constructorsTitles },
    { label: "Titres pilotes", value: team.driversTitles },
    { label: "1re saison", value: team.firstSeason ?? "—" },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12 md:py-16">
        <HatchOverlay />
        <GhostNumber className="-bottom-4 left-6 hidden text-[200px] md:left-12 md:block">
          {team.constructorsTitles > 0 ? team.constructorsTitles : "F1"}
        </GhostNumber>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-5">
              <SectionEyebrow color={color}>
                Écurie — Saison {season}
              </SectionEyebrow>
              <h1 className="max-w-3xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
                {team.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
                <span
                  className="h-5 w-1.5 shrink-0"
                  aria-hidden
                  style={{ background: color }}
                />
                <span className="font-semibold">
                  {flag} {team.nationality ?? "Nationalité inconnue"}
                </span>
                {team.url && (
                  <>
                    <span className="hidden h-4 w-px bg-white/20 sm:block" />
                    <a
                      href={team.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
                    >
                      Wikipédia ↗
                    </a>
                  </>
                )}
              </div>
            </div>
            <SeasonUrlSelect value={season} triggerClassName="w-[140px] h-11" />
          </div>

          {standing ? (
            <div className="grid w-fit grid-cols-3 gap-px border border-white/8 bg-white/8">
              {[
                { label: "Position", value: standing.position ?? "—" },
                { label: "Points", value: standing.points ?? "—" },
                { label: "Victoires", value: standing.wins ?? 0 },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 bg-background px-8 py-5"
                >
                  <span
                    className="font-mono text-3xl font-extrabold leading-none"
                    style={i === 0 ? { color } : undefined}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/55">
              Aucun classement communiqué pour la saison {season}.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 border-b border-border px-6 py-10 md:px-12">
        <SectionEyebrow color={color}>
          Effectif {season}
          {lineup.length > 2 ? " — remplaçants compris" : ""}
        </SectionEyebrow>

        {lineup.length === 0 ? (
          <p className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
            Aucun pilote enregistré pour cette écurie en {season}. Elle n&apos;a
            peut-être pas couru cette saison-là.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
            {lineup.map((driver) => (
              <li key={driver.id}>
                <Link
                  href={`/drivers/${driver.id}`}
                  className="flex h-full flex-col gap-3 bg-background p-6 transition-colors hover:bg-[#12151a]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/45">
                      {driver.shortName ?? driver.surname.slice(0, 3)}
                    </span>
                    {driver.number !== null && (
                      <span className="font-mono text-2xl font-black italic text-foreground/20">
                        {driver.number}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-extrabold uppercase leading-tight tracking-wide">
                    {driver.name} {driver.surname}
                  </span>
                  <div className="mt-auto flex items-center gap-4 font-mono text-xs text-foreground/60">
                    {driver.position !== null && (
                      <span>P{driver.position}</span>
                    )}
                    {driver.points !== null && <span>{driver.points} pts</span>}
                    {driver.wins ? <span>{driver.wins} V</span> : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        <SectionEyebrow color={color}>Palmarès</SectionEyebrow>
        <div className="grid grid-cols-3 gap-px border border-white/8 bg-white/8">
          {palmares.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1.5 bg-background p-6"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/45">
                {item.label}
              </span>
              <span className="font-mono text-2xl font-extrabold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <Link
          href={`/standings?season=${season}`}
          className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
        >
          Classement constructeurs {season} →
        </Link>
      </section>
    </div>
  );
}
