"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { DriverCard } from "@/components/drivers/DriverCard";
import { DriverSearchBar } from "@/components/drivers/DriverSearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDrivers } from "@/features/drivers/useDrivers";

const seasons = ["current", "2025", "2024", "2023", "2022", "2021", "2020"];

export function DriversPageClient() {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("current");
  const { data: drivers, isLoading, isError } = useDrivers(search, season);

  const title =
    search.trim().length > 0
      ? `Résultats pour "${search}"`
      : season === "current"
        ? "Pilotes saison en cours"
        : `Pilotes ${season}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Recherchez un pilote par nom ou sélectionnez une saison.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="w-36">
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

      <DriverSearchBar value={search} onChange={setSearch} />

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des pilotes...
        </div>
      )}
      {isError && <p>Impossible de charger les pilotes pour le moment.</p>}

      {!isLoading && drivers && drivers.length === 0 && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
          Aucun pilote trouvé. Essayez une autre recherche ou changez de saison.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(drivers ?? []).map((driver: any) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  );
}
