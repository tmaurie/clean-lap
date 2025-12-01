"use client";

import { useMemo, useState } from "react";
import { Filter, Loader2 } from "lucide-react";

import { DriverCard } from "@/components/drivers/DriverCard";
import { DriverSearchBar } from "@/components/drivers/DriverSearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrivers } from "@/features/drivers/useDrivers";

const seasons = [
  "current",
  ...Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) =>
    (1950 + i).toString(),
  ).reverse(),
];

export function DriversPageClient() {
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState("current");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const { data: drivers, isLoading, isError } = useDrivers(search, season);

  const teams = useMemo(
    () =>
      Array.from(
        new Set(
          (drivers ?? []).map((driver: any) => driver.teamId).filter(Boolean),
        ),
      ).sort(),
    [drivers],
  );

  const filteredDrivers = useMemo(
    () =>
      (drivers ?? []).filter((driver: any) =>
        teamFilter === "all" ? true : driver.teamId === teamFilter,
      ),
    [drivers, teamFilter],
  );

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" aria-hidden />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Filtres pilotes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Saison
              </DropdownMenuLabel>
              <ScrollArea className="h-64">
                <DropdownMenuRadioGroup
                  value={season}
                  onValueChange={(value) => setSeason(value)}
                >
                  {seasons.map((s) => (
                    <DropdownMenuRadioItem key={s} value={s}>
                      {s === "current" ? "Saison en cours" : s}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </ScrollArea>

              {teams.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Equipe
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={teamFilter}
                    onValueChange={(value) => setTeamFilter(value)}
                  >
                    <DropdownMenuRadioItem value="all">
                      Toutes les equipes
                    </DropdownMenuRadioItem>
                    {teams.map((team) => (
                      <DropdownMenuRadioItem key={team} value={team}>
                        {team}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setSearch("");
                  setTeamFilter("all");
                  setSeason("current");
                }}
              >
                Reinitialiser
                <DropdownMenuShortcut>Cmd+R</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border bg-muted/50 px-3 py-1">
          Saison: {season === "current" ? "en cours" : season}
        </span>
        {teamFilter !== "all" ? (
          <span className="rounded-full border bg-muted/30 px-3 py-1">
            Equipe: {teamFilter}
          </span>
        ) : (
          <span className="rounded-full border bg-muted/30 px-3 py-1">
            Toutes les equipes
          </span>
        )}
      </div>

      <DriverSearchBar value={search} onChange={setSearch} />

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des pilotes...
        </div>
      )}
      {isError && <p>Impossible de charger les pilotes pour le moment.</p>}

      {!isLoading && filteredDrivers.length === 0 && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
          Aucun pilote trouvé. Essayez une autre recherche ou changez de saison.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver: any) => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  );
}
