import { notFound } from "next/navigation";
import Link from "next/link";

import { fetchDriverSeason } from "@/lib/api/drivers";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { GhostNumber } from "@/components/paddock/GhostNumber";

function formatBirthday(birthday?: string | null) {
  if (!birthday) return null;
  const d = new Date(birthday);
  if (Number.isNaN(d.getTime())) return null;
  const age = Math.floor(
    (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  const label = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Né le ${label} · ${age} ans`;
}

export default async function DriverPage({ params, searchParams }: any) {
  const { driverId } = await params;
  const { season } = await searchParams;

  const currentSeason = season ?? "current";
  const data = await fetchDriverSeason(driverId, currentSeason);

  if (!data) return notFound();

  const { driver, stats, races } = data;
  const flag = driver.nationality ? countryToFlagEmoji(driver.nationality) : "";
  const teamColor = getConstructorColor(driver.teamId || "");
  const birthdayLabel = formatBirthday(driver.birthday);

  const statTiles = [
    { label: "Points", value: stats.points },
    { label: "Victoires", value: stats.wins },
    { label: "Podiums", value: stats.podiums },
    { label: "Moyenne grille", value: stats.avgGrid ?? "N/A" },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/50">
          <Link href="/drivers" className="hover:text-foreground">
            Pilotes
          </Link>
          <span>/</span>
          <span className="text-foreground">
            {driver.name} {driver.surname}
          </span>
        </div>
        <Link
          href="/drivers"
          className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-foreground/70 hover:border-white/40 hover:text-foreground"
        >
          ← Tous les pilotes
        </Link>
      </div>

      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <span
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: teamColor }}
        />
        <HatchOverlay />
        <GhostNumber className="right-6 -bottom-10 text-[280px] text-white/[0.06]">
          {driver.number ?? ""}
        </GhostNumber>
        <div className="relative flex flex-wrap items-end justify-between gap-10">
          <div className="flex flex-col gap-5">
            <SectionEyebrow color={teamColor}>
              {driver.teamId || "Équipe inconnue"} — nº {driver.number ?? "?"}
              {flag ? ` · ${flag} ${driver.nationality}` : ""}
            </SectionEyebrow>
            <div className="flex flex-col gap-0">
              <span className="text-2xl font-medium text-foreground/60">
                {driver.name}
              </span>
              <h1 className="text-6xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-7xl">
                {driver.surname}
              </h1>
            </div>
            {birthdayLabel && (
              <p className="text-sm text-foreground/70">{birthdayLabel}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-px border border-white/8 bg-white/8">
            {statTiles.map((tile) => (
              <div
                key={tile.label}
                className="flex flex-col gap-1 bg-background px-7 py-4"
              >
                <span className="text-3xl font-extrabold leading-none">
                  {tile.value}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionEyebrow>
            Saison {currentSeason === "current" ? "en cours" : currentSeason} —
            course par course
          </SectionEyebrow>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/drivers/${driver.id}?season=current`}
              className="border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-foreground/70 hover:border-white/40 hover:text-foreground"
            >
              Saison en cours
            </Link>
            {[...Array(5)].map((_, index) => {
              const yr = (new Date().getFullYear() - index).toString();
              return (
                <Link
                  key={yr}
                  href={`/drivers/${driver.id}?season=${yr}`}
                  className="border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-foreground/70 hover:border-white/40 hover:text-foreground"
                >
                  {yr}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col border-t border-border">
          {races.length === 0 && (
            <p className="py-6 text-sm text-foreground/50">
              Aucun résultat disponible pour cette saison.
            </p>
          )}
          {races.map((race) => {
            const raceFlag = race.location
              ? countryToFlagEmoji(race.location.split(", ").at(-1) || "")
              : "";
            const pos = race.position;
            const posNum = Number(pos);
            const isWin = Number.isFinite(posNum) && posNum === 1;
            const points = Number(race.points) || 0;
            return (
              <div
                key={`${race.round}-${race.raceName}`}
                className="flex items-center gap-5 border-b border-border py-3.5"
              >
                <span className="w-9 font-mono text-xs text-foreground/40">
                  R{race.round ?? "-"}
                </span>
                <span className="w-6 text-lg">{raceFlag}</span>
                <span className="flex-1 text-sm font-bold uppercase tracking-wide">
                  {race.raceName}
                </span>
                <span className="w-14 text-right font-mono text-xs text-foreground/50">
                  grille {race.grid ?? "–"}
                </span>
                <span
                  className="w-14 text-right text-xl font-black italic"
                  style={{
                    color: isWin ? "var(--primary)" : "rgba(244,244,242,0.55)",
                  }}
                >
                  {pos ? `P${pos}` : "–"}
                </span>
                <span className="w-12 text-right text-sm font-extrabold">
                  {points > 0 ? `+${points}` : "–"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
