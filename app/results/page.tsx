"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { ResultsPageClient } from "@/app/results/ResultsPageClient";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { Season } from "@/entities/season/model";
import { getSeasonsWithRaceCount } from "@/features/results/hooks";

const PAGE_SIZE = 12;

type LoadOptions = {
  reset?: boolean;
};

export default function ResultsIndexPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const lastRequestedPageRef = useRef(1);

  const loadPage = useCallback(
    async (pageToLoad: number, options: LoadOptions = {}) => {
      if (loadingRef.current) {
        return;
      }

      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;
      lastRequestedPageRef.current = pageToLoad;

      if (options.reset) {
        setSeasons([]);
        setHasMore(true);
      }

      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const newSeasons = await getSeasonsWithRaceCount(
          pageToLoad,
          PAGE_SIZE,
          controller.signal,
        );

        if (!newSeasons || newSeasons.length === 0) {
          setHasMore(false);
          return;
        }

        let hasAdded = false;
        setSeasons((prev) => {
          const base = options.reset ? [] : prev;
          const map = new Map(base.map((season) => [season.season, season]));

          for (const season of newSeasons) {
            if (!map.has(season.season)) {
              hasAdded = true;
            }
            map.set(season.season, season);
          }

          return Array.from(map.values()).sort(
            (a, b) => Number(b.season) - Number(a.season),
          );
        });

        setPage((prev) => (options.reset ? 1 : Math.max(prev, pageToLoad)));

        if (!hasAdded || newSeasons.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setError(
          "Impossible de charger les saisons pour le moment. Merci de réessayer.",
        );
      } finally {
        loadingRef.current = false;
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadPage(1, { reset: true });

    return () => {
      abortRef.current?.abort();
    };
  }, [loadPage]);

  const handleLoadMore = () => {
    if (!hasMore || isLoading) {
      return;
    }

    const nextPage = page + 1;
    loadPage(nextPage);
  };

  const handleRetry = () => {
    const lastPage = lastRequestedPageRef.current || 1;
    loadPage(lastPage, { reset: seasons.length === 0 });
  };

  const isInitialLoading = isLoading && seasons.length === 0;

  const { newestSeason, oldestSeason, totalRaces } = useMemo(() => {
    if (!seasons.length) {
      return {
        newestSeason: undefined,
        oldestSeason: undefined,
        totalRaces: 0,
      };
    }

    const sorted = [...seasons].sort(
      (a, b) => Number(b.season) - Number(a.season),
    );

    const newest = sorted[0]?.season;
    const oldest = sorted.at(-1)?.season;
    const races = sorted.reduce((acc, season) => acc + season.raceCount, 0);

    return { newestSeason: newest, oldestSeason: oldest, totalRaces: races };
  }, [seasons]);

  const coverageLabel =
    newestSeason && oldestSeason
      ? oldestSeason === newestSeason
        ? newestSeason
        : `${oldestSeason} – ${newestSeason}`
      : "—";

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <div className="relative flex flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-2xl flex-col gap-5">
            <SectionEyebrow>
              Archives — {coverageLabel} · {totalRaces || "—"} Grands Prix
            </SectionEyebrow>
            <h1 className="text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
              Résultats
            </h1>
            <p className="text-sm leading-relaxed text-foreground/55">
              Remontez le temps saison par saison. Champions pilotes et
              constructeurs en un coup d&apos;œil, résultats complets de chaque
              Grand Prix en un clic.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        {error && (
          <div className="flex flex-col gap-3 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="w-fit text-xs font-bold uppercase tracking-[0.1em] text-destructive hover:text-destructive/80"
            >
              Réessayer le chargement
            </button>
          </div>
        )}

        <ResultsPageClient
          seasons={seasons}
          isLoading={isLoading}
          isInitialLoading={isInitialLoading}
        />

        {!isInitialLoading && (
          <div className="flex justify-center pt-4">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="inline-flex h-[52px] min-w-[220px] items-center justify-center border border-white/20 px-10 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:border-white/50 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden
                    />
                    Chargement…
                  </>
                ) : (
                  "Charger plus de saisons"
                )}
              </button>
            ) : (
              seasons.length > 0 && (
                <p className="text-sm text-foreground/50">
                  Toutes les saisons disponibles sont visibles.
                </p>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
