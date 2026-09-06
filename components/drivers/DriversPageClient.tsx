"use client";

import { useMemo, useState } from "react";

import { DriverCard } from "@/components/drivers/DriverCard";
import { DriverSearchBar } from "@/components/drivers/DriverSearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { useDrivers } from "@/features/drivers/useDrivers";
import { getConstructorLabel } from "@/lib/utils/colors";
import type { Driver } from "@/entities/driver/model";
import { SkeletonScreen } from "@/components/skeletons/PageSkeletons";
import { Skeleton } from "@/components/ui/skeleton";

const seasons = ["current", "2025", "2024", "2023", "2022", "2021", "2020"];

export function DriversPageClient() {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("current");
  const [team, setTeam] = useState("all");
  const { data: drivers, isLoading, isError } = useDrivers(search, season);

  const teams = useMemo(() => {
    const unique = new Set(
      (drivers ?? []).map((d: Driver) => d.teamId).filter(Boolean),
    );
    return Array.from(unique) as string[];
  }, [drivers]);

  const filteredDrivers = useMemo(() => {
    if (team === "all") return drivers ?? [];
    return (drivers ?? []).filter((d: Driver) => d.teamId === team);
  }, [drivers, team]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              Saison {season === "current" ? "en cours" : season} —{" "}
              {drivers?.length ?? 0} titulaires
            </SectionEyebrow>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Pilotes
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DriverSearchBar value={search} onChange={setSearch} />
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger className="h-11 w-[190px] border-white/15 font-mono text-xs font-bold uppercase tracking-[0.08em]">
                <SelectValue placeholder="Écurie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Écurie : toutes</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t} value={t}>
                    {getConstructorLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="h-11 w-[150px] border-white/15 font-mono text-xs font-bold uppercase tracking-[0.08em]">
                <SelectValue placeholder="Saison" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "current" ? "Saison en cours" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        {isError && (
          <p className="text-sm text-foreground/50">
            Impossible de charger les pilotes pour le moment.
          </p>
        )}

        {isLoading ? (
          // Une grille de cartes fantômes au lieu d'un spinner + grille vide :
          // même gabarit que le rendu final, donc pas de saut de mise en page.
          <SkeletonScreen label="Chargement des pilotes">
            <div className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 bg-background p-6">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-7 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </SkeletonScreen>
        ) : filteredDrivers.length === 0 ? (
          <div className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
            Aucun pilote trouvé. Essayez une autre recherche ou changez de
            saison.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
