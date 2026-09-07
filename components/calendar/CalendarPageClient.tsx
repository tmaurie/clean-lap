"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { getRacesWithWinner } from "@/features/results/hooks";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import {
  RowsSkeleton,
  SkeletonScreen,
} from "@/components/skeletons/PageSkeletons";

type RaceWithWinner = Awaited<ReturnType<typeof getRacesWithWinner>>[number];

export function CalendarPageClient() {
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [races, setRaces] = useState<RaceWithWinner[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    // `ignore` : une réponse lente d'une saison précédente ne doit pas écraser
    // celle qu'on affiche maintenant.
    let ignore = false;

    setStatus("loading");
    getRacesWithWinner(season)
      .then((data) => {
        if (ignore) return;
        setRaces(data);
        setStatus("ready");
      })
      .catch((error) => {
        // Sans ce catch, une saison hors calendrier laissait une liste vide,
        // impossible à distinguer d'une saison sans course.
        if (ignore) return;
        console.error(`[calendar] saison ${season} indisponible`, error);
        setRaces([]);
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [season]);

  const ready = status === "ready";
  const completedRaces = races.filter((race) => Boolean(race.winner));
  const remainingRaces = races.filter((race) => !race.winner);
  const nextRound = remainingRaces[0]?.round;

  const formatDateLabel = (race: RaceWithWinner) => {
    const d = new Date(`${race.date}T${race.time ?? "00:00:00Z"}`);
    if (Number.isNaN(d.getTime())) return race.date;
    const day = d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
    const time = race.time
      ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : null;
    return time ? `${day} · ${time}` : day;
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <SectionEyebrow>
                Saison {season} — {ready ? races.length : "—"} Grands Prix
              </SectionEyebrow>
              <SeasonSelect
                value={season}
                action={setSeason}
                triggerClassName="w-[120px]"
              />
            </div>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Calendrier
            </h1>
            {/* Les circuits n'ont pas d'entrée de navigation propre : la barre
                est pleine à huit entrées. On y accède depuis le calendrier,
                leur contexte naturel. */}
            <Link
              href={`/circuits?season=${season}`}
              className="w-fit text-xs font-bold uppercase tracking-[0.1em] text-primary hover:text-primary/80"
            >
              Voir tous les circuits →
            </Link>
          </div>
          <div className="flex gap-px border border-white/8 bg-white/8">
            {[
              // Pas de "0" trompeur tant que la saison n'est pas chargée.
              { value: ready ? races.length : "—", label: "Manches" },
              {
                value: ready ? completedRaces.length : "—",
                label: "Disputées",
              },
              {
                value: ready ? remainingRaces.length : "—",
                label: "Restantes",
                accent: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-0.5 bg-background px-7 py-4"
              >
                <span
                  className={
                    "text-3xl font-extrabold leading-none " +
                    (stat.accent ? "text-primary" : "")
                  }
                >
                  {stat.value}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {status === "loading" ? (
        <SkeletonScreen
          label={`Chargement du calendrier ${season}`}
          className="gap-10 px-6 py-10 md:px-12"
        >
          <RowsSkeleton rows={8} />
        </SkeletonScreen>
      ) : status === "error" ? (
        <section className="flex flex-col gap-4 px-6 py-10 md:px-12">
          <h2 className="text-2xl font-black italic uppercase tracking-tight">
            Saison indisponible
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            Aucune donnée pour la saison {season}. Elle n&apos;est peut-être pas
            au calendrier, ou l&apos;API est momentanément indisponible.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-10 px-6 py-10 md:px-12">
          <div className="flex flex-col gap-4">
            <SectionEyebrow>À venir</SectionEyebrow>
            <div className="flex flex-col border-t border-border">
              {remainingRaces.length === 0 && (
                <p className="py-4 text-sm text-foreground/50">
                  Aucune course restante pour cette saison.
                </p>
              )}
              {remainingRaces.map((race) => {
                const isNext = race.round === nextRound;
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );
                return (
                  <div
                    key={race.round}
                    className="flex items-center gap-8 border-b border-border py-5 pl-4 transition-colors hover:bg-[#12151a]"
                    style={{
                      borderLeft: `3px solid ${isNext ? "var(--primary)" : "transparent"}`,
                      background: isNext ? "#12151a" : "transparent",
                    }}
                  >
                    <span
                      className="w-[70px] text-3xl font-black italic"
                      style={{
                        color: isNext
                          ? "var(--primary)"
                          : "rgba(244,244,242,0.35)",
                      }}
                    >
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
                    {isNext && (
                      <span className="bg-primary px-3 py-[5px] text-[11px] font-extrabold italic uppercase tracking-[0.1em] text-primary-foreground">
                        Ce week-end
                      </span>
                    )}
                    <span className="w-[130px] text-right font-mono text-[13px] text-foreground/70">
                      {formatDateLabel(race)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <SectionEyebrow>Disputées</SectionEyebrow>
            <div className="flex flex-col border-t border-border">
              {completedRaces.length === 0 && (
                <p className="py-4 text-sm text-foreground/50">
                  La saison n&apos;a pas encore commencé.
                </p>
              )}
              {completedRaces.map((race) => {
                const flag = countryToFlagEmoji(
                  race.location.split(", ").at(-1) || "",
                );
                const winnerColor = getConstructorColor(race.winnerTeam || "");
                return (
                  <div
                    key={race.round}
                    className="flex items-center gap-8 border-b border-border py-5 opacity-75 transition-opacity hover:bg-[#12151a] hover:opacity-100"
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
                      {formatDateLabel(race)}
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
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
