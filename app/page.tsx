import Link from "next/link";

import {
  fetchRaceResults,
  fetchRaceSchedule,
  fetchRaces,
} from "@/lib/api/race";
import {
  fetchConstructorStandings,
  fetchDriverStandings,
} from "@/lib/api/standings";
import { isPastRace } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getConstructorColor } from "@/lib/utils/colors";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { GhostNumber } from "@/components/paddock/GhostNumber";
import { HeroCountdown } from "@/components/home/HeroCountdown";
import { StandingsToggleList } from "@/components/home/StandingsToggleList";

export const revalidate = 60;

function formatSessionTime(session?: {
  date: string | null;
  time: string | null;
}) {
  if (!session?.date) return null;
  const d = new Date(`${session.date}T${session.time ?? "00:00:00Z"}`);
  if (Number.isNaN(d.getTime())) return null;
  return {
    weekday: d.toLocaleDateString("fr-FR", { weekday: "short" }),
    time: session.time
      ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : null,
  };
}

export default async function HomePage() {
  const races = await fetchRaces("current");
  const completedCount = races.filter((race) => isPastRace(race.date)).length;
  const hasNextRace = races.length > 0 && completedCount < races.length;
  const nextIndex = hasNextRace ? completedCount : races.length;
  const nextRace = hasNextRace ? races[nextIndex] : undefined;
  const nextRound = nextIndex + 1;
  const upcomingRaces = hasNextRace
    ? races.slice(nextIndex + 1, nextIndex + 5)
    : [];

  const [schedule, lastRace, driverStandings, constructorStandings] =
    await Promise.all([
      nextRace ? fetchRaceSchedule("current", String(nextRound)) : null,
      fetchRaceResults("current", "last"),
      fetchDriverStandings("current"),
      fetchConstructorStandings("current"),
    ]);

  const flag = nextRace
    ? countryToFlagEmoji(nextRace.location.split(", ").at(-1) || "")
    : "";

  const sessionItems = schedule
    ? [
        { key: "fp1", label: "FP1", session: schedule.schedule.fp1 },
        { key: "fp2", label: "FP2", session: schedule.schedule.fp2 },
        { key: "fp3", label: "FP3", session: schedule.schedule.fp3 },
        { key: "qualy", label: "Qualif", session: schedule.schedule.qualy },
        { key: "race", label: "Course", session: schedule.schedule.race },
      ]
    : [];

  const lastRacePodium = (lastRace?.results ?? []).slice(0, 6).map((r, i) => ({
    ...r,
    teamColor: getConstructorColor(r.constructor),
    numColor: i === 0 ? "var(--primary)" : "rgba(244,244,242,0.35)",
  }));

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12 md:py-16">
        <HatchOverlay />
        <GhostNumber className="-bottom-2 left-6 hidden text-[220px] md:left-12 md:block">
          {hasNextRace ? `R${nextRound}` : "🏁"}
        </GhostNumber>
        <div className="relative flex flex-col gap-8">
          <SectionEyebrow>
            {hasNextRace
              ? `Manche ${nextRound} / ${races.length || "—"} — Ce week-end`
              : races.length > 0
                ? `Saison terminée — ${races.length} manches disputées`
                : "Aucune course programmée"}
          </SectionEyebrow>

          {nextRace ? (
            <>
              <h1 className="max-w-4xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                {nextRace.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 sm:gap-6">
                <span className="font-semibold">
                  {flag} {nextRace.circuit}
                </span>
                <span className="hidden h-4 w-px bg-white/20 sm:block" />
                <span>
                  {new Date(
                    `${nextRace.date}T${nextRace.time ?? "00:00:00Z"}`,
                  ).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  ·{" "}
                  {new Date(
                    `${nextRace.date}T${nextRace.time ?? "00:00:00Z"}`,
                  ).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {schedule?.circuitDetails?.circuitLength && (
                  <>
                    <span className="hidden h-4 w-px bg-white/20 sm:block" />
                    <span className="font-mono text-xs">
                      {schedule.circuitDetails.circuitLength}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-end justify-between gap-8">
                <HeroCountdown
                  targetIso={`${nextRace.date}T${nextRace.time ?? "00:00:00Z"}`}
                />
                <div className="flex gap-4">
                  <Link
                    href="/calendar"
                    className="inline-flex h-[52px] items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Voir le week-end →
                  </Link>
                  <Link
                    href="/calendar"
                    className="inline-flex h-[52px] items-center border border-white/20 px-9 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:border-white/50"
                  >
                    Calendrier complet
                  </Link>
                </div>
              </div>

              {sessionItems.length > 0 && (
                <div className="flex w-fit flex-wrap gap-px bg-white/8 border border-white/8">
                  {sessionItems.map((item) => {
                    const formatted = formatSessionTime(item.session);
                    return (
                      <div
                        key={item.key}
                        className={
                          item.key === "race"
                            ? "flex flex-col gap-0.5 border-t-2 border-primary bg-[#16181d] px-6 py-3.5"
                            : "flex flex-col gap-0.5 bg-background px-6 py-3.5"
                        }
                      >
                        <span
                          className={
                            "text-[11px] font-bold uppercase tracking-[0.15em] " +
                            (item.key === "race"
                              ? "text-primary"
                              : "text-foreground/45")
                          }
                        >
                          {item.label}
                        </span>
                        <span className="font-mono text-[13px]">
                          {formatted
                            ? `${formatted.weekday} ${formatted.time ?? ""}`.trim()
                            : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="text-foreground/60">
              Aucune course à venir pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* DERNIER GP + CHAMPIONNAT */}
      <section className="grid border-b border-border md:grid-cols-2">
        <div className="flex flex-col gap-6 border-b border-border px-6 py-10 md:border-b-0 md:border-r md:px-12">
          <div className="flex items-baseline justify-between">
            <SectionEyebrow>
              Dernier GP {lastRace ? `— ${lastRace.raceName}` : ""}
            </SectionEyebrow>
            <Link
              href="/results"
              className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
            >
              Résultats →
            </Link>
          </div>
          <div className="flex flex-col">
            {lastRacePodium.length === 0 && (
              <p className="py-4 text-sm text-foreground/50">
                Résultats non disponibles.
              </p>
            )}
            {lastRacePodium.map((r) => (
              <div
                key={r.position}
                className="flex items-center gap-5 border-b border-border py-[13px]"
              >
                <span
                  className="w-9 text-2xl font-black italic"
                  style={{ color: r.numColor }}
                >
                  {r.position}
                </span>
                <span className="h-8 w-1" style={{ background: r.teamColor }} />
                <div className="flex flex-1 flex-col">
                  <span className="text-[15px] font-bold uppercase tracking-wide">
                    {r.driver}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {r.constructor}
                  </span>
                </div>
                <span className="font-mono text-[13px] text-foreground/70">
                  {r.time}
                </span>
                <span className="w-16 text-right text-[15px] font-extrabold">
                  {r.points}{" "}
                  <span className="text-[11px] font-semibold text-foreground/50">
                    PTS
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-10 md:px-12">
          <StandingsToggleList
            drivers={driverStandings}
            constructors={constructorStandings}
          />
        </div>
      </section>

      {/* PROCHAINES MANCHES */}
      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        <div className="flex items-baseline justify-between">
          <SectionEyebrow>Prochaines manches</SectionEyebrow>
          <Link
            href="/calendar"
            className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
          >
            Calendrier complet →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
          {upcomingRaces.map((race, i) => {
            const round = nextIndex + 2 + i;
            const raceFlag = countryToFlagEmoji(
              race.location.split(", ").at(-1) || "",
            );
            return (
              <div
                key={race.name}
                className="relative flex flex-col gap-3.5 bg-background p-6 transition-colors hover:bg-[#12151a]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black italic text-foreground/25">
                    R{round}
                  </span>
                  <span className="text-xl">{raceFlag}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-base font-extrabold uppercase leading-tight tracking-wide">
                    {race.name}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {race.circuit}
                  </span>
                </div>
                <span className="font-mono text-xs text-foreground/70">
                  {new Date(race.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            );
          })}
          {upcomingRaces.length === 0 && (
            <p className="col-span-full py-4 text-sm text-foreground/50">
              Aucune autre course programmée pour le moment.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
