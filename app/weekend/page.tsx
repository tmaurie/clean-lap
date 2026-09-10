import type { Metadata } from "next";
import Link from "next/link";

import { HeroCountdown } from "@/components/home/HeroCountdown";
import { GhostNumber } from "@/components/paddock/GhostNumber";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { RaceReminder } from "@/components/weekend/RaceReminder";
import { SessionTimeline } from "@/components/weekend/SessionTimeline";
import { getCurrentWeekend } from "@/features/weekend/getWeekend";
import { formatSessionDay, formatSessionTime } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import {
  currentOrNextSession,
  isSprintWeekend,
  isWeekendOver,
} from "@/lib/utils/session";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Week-end de course — CleanLap",
  description:
    "Essais libres, qualifications, sprint et course : le planning complet du week-end de Formule 1 en cours, avec l'état de chaque session.",
};

export default async function WeekendPage() {
  const weekend = await getCurrentWeekend();

  if (!weekend) {
    return (
      <div className="flex flex-col">
        <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
          <HatchOverlay />
          <div className="relative flex flex-col gap-5">
            <SectionEyebrow>Week-end</SectionEyebrow>
            <h1 className="text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Aucun week-end en cours
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
              La saison est terminée ou le planning n&apos;est pas encore
              publié. Le calendrier complet reste consultable.
            </p>
            <Link
              href="/calendar"
              className="inline-flex h-[52px] w-fit items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Voir le calendrier →
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const { race, season, round, total, sessions, circuit } = weekend;
  const nextSession = currentOrNextSession(sessions);
  const over = isWeekendOver(sessions);
  const sprint = isSprintWeekend(sessions);
  const flag = countryToFlagEmoji(race.location.split(", ").at(-1) || "");

  const circuitFacts = [
    { label: "Longueur", value: circuit?.circuitLength },
    { label: "Virages", value: circuit?.corners?.toString() },
    { label: "Record du tour", value: circuit?.lapRecord },
    {
      label: "1re édition",
      value: circuit?.firstParticipationYear?.toString(),
    },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12 md:py-16">
        <HatchOverlay />
        <GhostNumber className="-bottom-2 left-6 hidden text-[220px] md:left-12 md:block">
          {`R${round}`}
        </GhostNumber>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4">
            <SectionEyebrow>
              {`Manche ${round} / ${total || "—"} — Week-end`}
            </SectionEyebrow>
            {sprint && (
              <span className="border border-primary/50 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                Format sprint
              </span>
            )}
          </div>

          <h1 className="max-w-4xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            {race.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70 sm:gap-6">
            <span className="font-semibold">
              {flag}{" "}
              {race.circuitId ? (
                <Link
                  href={`/circuits/${race.circuitId}?season=${season}`}
                  className="underline underline-offset-4 transition-colors hover:text-primary"
                >
                  {race.circuit}
                </Link>
              ) : (
                race.circuit
              )}
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span>{race.location}</span>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-8">
            {nextSession ? (
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/50">
                  {nextSession.status === "live"
                    ? `${nextSession.label} — en direct`
                    : `Prochaine session · ${nextSession.label}`}
                </span>
                <HeroCountdown targetIso={nextSession.startsAt.toISOString()} />
              </div>
            ) : (
              <div className="flex w-fit items-center gap-2 border border-white/15 px-6 py-5 font-mono text-sm font-semibold uppercase tracking-wide text-foreground/60">
                {over
                  ? "🏁 Week-end terminé"
                  : "Planning non communiqué pour le moment"}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/results/${season}/${round}`}
                className="inline-flex h-[52px] items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Résultats détaillés →
              </Link>
              <Link
                href="/calendar"
                className="inline-flex h-[52px] items-center border border-white/20 px-9 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:border-white/50"
              >
                Calendrier complet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLANNING */}
      <section className="flex flex-col gap-6 border-b border-border px-6 py-10 md:px-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionEyebrow>Déroulé du week-end</SectionEyebrow>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/55">
            Horaires en heure de Paris
          </span>
        </div>
        <SessionTimeline sessions={sessions} />

        <RaceReminder
          raceName={race.name}
          raceKey={`${season}-${round}`}
          raceStartsAtIso={sessions
            .find((session) => session.key === "race")
            ?.startsAt.toISOString()}
          calendarHref={`/api/calendar?season=${season}&round=${round}`}
        />
      </section>

      {/* CIRCUIT */}
      {circuitFacts.length > 0 && (
        <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
          <SectionEyebrow>Le circuit</SectionEyebrow>
          <div className="grid grid-cols-2 gap-px border border-white/8 bg-white/8 sm:grid-cols-4">
            {circuitFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col gap-1.5 bg-background p-6"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55">
                  {fact.label}
                </span>
                <span className="font-mono text-lg font-extrabold">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
          {race.time && (
            <p className="text-sm text-foreground/55">
              Départ de la course le{" "}
              {formatSessionDay(
                sessions.find((session) => session.key === "race")?.startsAt ??
                  new Date(`${race.date}T${race.time}`),
              )}{" "}
              à{" "}
              {formatSessionTime(
                sessions.find((session) => session.key === "race")?.startsAt ??
                  new Date(`${race.date}T${race.time}`),
              )}
              .
            </p>
          )}
        </section>
      )}
    </div>
  );
}
