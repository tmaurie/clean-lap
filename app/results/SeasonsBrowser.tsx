"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { SeasonGrid } from "@/app/results/SeasonGrid";
import type { Season } from "@/entities/season/model";
import { seasonsPageCount } from "@/lib/api/seasonsPage";

/**
 * Pagination « charger plus » de la liste des saisons.
 *
 * La première page est rendue par le serveur et arrive en props : la page a
 * donc son contenu sans JavaScript, et ce composant ne sert qu'aux suivantes.
 * Elles passent par `/api/seasons`, jamais par f1api.dev directement.
 */
export function SeasonsBrowser({
  initialSeasons,
}: {
  initialSeasons: Season[];
}) {
  const [seasons, setSeasons] = useState(initialSeasons);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const totalPages = seasonsPageCount();
  const hasMore = page < totalPages;

  const loadMore = async () => {
    if (status === "loading" || !hasMore) return;

    const next = page + 1;
    setStatus("loading");

    try {
      const response = await fetch(`/api/seasons?page=${next}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const { seasons: nouvelles } = (await response.json()) as {
        seasons: Season[];
      };

      // Dédoublonnage par année : deux clics rapides ne doivent pas afficher
      // la même saison deux fois.
      setSeasons((prev) => {
        const connues = new Set(prev.map((s) => s.season));
        return [...prev, ...nouvelles.filter((s) => !connues.has(s.season))];
      });
      setPage(next);
      setStatus("idle");
    } catch (error) {
      console.error(`[results] page ${next} indisponible`, error);
      setStatus("error");
    }
  };

  return (
    <>
      {status === "error" && (
        <div className="flex flex-col gap-3 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p>
            Impossible de charger les saisons suivantes. Celles déjà affichées
            restent consultables.
          </p>
          <button
            type="button"
            onClick={loadMore}
            className="w-fit text-xs font-bold uppercase tracking-[0.1em] text-destructive hover:text-destructive/80"
          >
            Réessayer
          </button>
        </div>
      )}

      <SeasonGrid
        seasons={seasons}
        pendingCount={status === "loading" ? 3 : 0}
      />

      <div className="flex justify-center pt-4">
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={status === "loading"}
            className="inline-flex h-[52px] min-w-[220px] items-center justify-center border border-white/20 px-10 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:border-white/50 disabled:opacity-50"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Chargement…
              </>
            ) : (
              "Charger plus de saisons"
            )}
          </button>
        ) : (
          <p className="text-sm text-foreground/55">
            Toutes les saisons disponibles sont visibles.
          </p>
        )}
      </div>
    </>
  );
}
