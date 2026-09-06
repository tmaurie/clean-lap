"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { getRacesWithWinner } from "@/features/results/hooks";
import { getConstructorColor } from "@/lib/utils/colors";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { Skeleton } from "@/components/ui/skeleton";

type RaceWithWinner = Awaited<ReturnType<typeof getRacesWithWinner>>[number];

export default function SeasonResultsPage({
  params,
}: {
  params: Promise<{ season: string }>;
}) {
  const { season } = React.use(params);
  const [races, setRaces] = useState<RaceWithWinner[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    // `ignore` évite qu'une réponse lente d'une saison précédente vienne
    // écraser celle de la saison affichée.
    let ignore = false;

    setStatus("loading");
    getRacesWithWinner(season)
      .then((data) => {
        if (ignore) return;
        setRaces(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (ignore) return;
        // Une saison hors calendrier renvoie 404 : la promesse rejetait sans
        // que personne ne l'écoute, et la page restait sur « Chargement… ».
        console.error(`[results] saison ${season} indisponible`, error);
        setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [season]);

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-6 px-6 py-14 md:px-12">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-72" />
        <div className="flex flex-col gap-px border border-white/8 bg-white/8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-5 bg-background p-5">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="hidden h-4 w-28 sm:block" />
            </div>
          ))}
        </div>
        <span className="sr-only" role="status">
          Chargement des résultats de la saison {season}
        </span>
      </div>
    );
  }

  if (status === "error" || races.length === 0) {
    return (
      <section className="relative overflow-hidden px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-col gap-6">
          <SectionEyebrow>Saison {season}</SectionEyebrow>
          <h1 className="text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {status === "error"
              ? "Saison indisponible"
              : "Aucune course enregistrée"}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            {status === "error"
              ? `Aucune donnée pour la saison ${season}. Elle n'est peut-être pas au calendrier, ou l'API est momentanément indisponible.`
              : `La saison ${season} existe mais ne contient aucune manche.`}
          </p>
          <Link
            href="/results"
            className="inline-flex h-[52px] w-fit items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Choisir une autre saison →
          </Link>
        </div>
      </section>
    );
  }

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
        <div className="px-6 py-10 text-sm text-foreground/50 md:px-12">
          Aucune course n&apos;est encore disponible pour cette saison.
        </div>
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
                    <span className="w-[70px] text-3xl font-black italic text-foreground/20">
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
                      {new Date(race.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
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
                    <span className="w-[70px] text-3xl font-black italic text-foreground/20">
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
                      {new Date(race.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
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
