"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, History, Loader2, Trophy } from "lucide-react";

import { ResultsPageClient } from "@/app/results/ResultsPageClient";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  const highlights = [
    {
      title: "Chronologie interactive",
      description:
        "Explorez chaque saison depuis la page de résultats dédiée et retrouvez rapidement un Grand Prix précis.",
      icon: <History className="h-5 w-5 text-primary" aria-hidden />,
    },
    {
      title: "Champions mis en avant",
      description:
        "Visualisez en un coup d'œil les champions pilotes et constructeurs pour contextualiser chaque année.",
      icon: <Trophy className="h-5 w-5 text-primary" aria-hidden />,
    },
    {
      title: "Navigation rapide",
      description:
        "Chargez progressivement les saisons sans recharger la page grâce à un système de pagination fluide.",
      icon: <CalendarClock className="h-5 w-5 text-primary" aria-hidden />,
    },
  ];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-primary/10 to-primary/20">
        <DotPattern className="text-primary/40 [mask-image:radial-gradient(circle_at_top,white,transparent_65%)]" />

        <div className="relative grid gap-12 px-6 py-16 md:grid-cols-[3fr_2fr] md:px-12 lg:px-16">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit">
              Archives officielles de la FIA
            </Badge>

            <div className="space-y-4 text-balance">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Résultats de Formule 1, saison par saison
              </h1>
              <p className="text-muted-foreground">
                Remontez le temps et redécouvrez chaque Grand Prix disputé depuis 1950.
                Les champions pilotes et constructeurs vous guident pour comprendre
                les enjeux de chaque saison.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="flex h-full items-start gap-3 rounded-xl border bg-card/60 p-4 backdrop-blur"
                >
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    {highlight.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {highlight.title}
                    </p>
                    <p>{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-primary/20 bg-background/80 backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-primary" aria-hidden />
                Archives dynamiques
              </CardTitle>
              <CardDescription>
                Un aperçu des saisons déjà chargées et des données disponibles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-muted-foreground">
                {isInitialLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <p>
                    {`Parcourez ${seasons.length.toString()} saison${
                      seasons.length > 1 ? "s" : ""
                    } et accédez aux classements détaillés en quelques clics.`}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-xl border border-muted-foreground/20 bg-card/60 px-4 py-3 backdrop-blur">
                  <span className="text-muted-foreground">Saisons chargées</span>
                  {isInitialLoading ? (
                    <Skeleton className="h-4 w-10" />
                  ) : (
                    <span className="font-medium text-foreground">
                      {seasons.length || "—"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-muted-foreground/20 bg-card/60 px-4 py-3 backdrop-blur">
                  <span className="text-muted-foreground">Période couverte</span>
                  {isInitialLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="font-medium text-foreground">
                      {coverageLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl border border-muted-foreground/20 bg-card/60 px-4 py-3 backdrop-blur">
                  <span className="text-muted-foreground">Grands Prix cumulés</span>
                  {isInitialLoading ? (
                    <Skeleton className="h-4 w-14" />
                  ) : (
                    <span className="font-medium text-foreground">
                      {totalRaces || "—"}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Sélectionnez une saison
            </h2>
            <p className="text-sm text-muted-foreground">
              Accédez aux résultats officiels de chaque Grand Prix, avec podiums,
              classements complets et détails du circuit.
            </p>
          </div>
          {!isInitialLoading && (
            <p className="text-sm text-muted-foreground">
              {hasMore
                ? "Plus de saisons sont disponibles dans l’archive."
                : "Toutes les saisons disponibles ont été chargées."}
            </p>
          )}
        </div>

        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p>{error}</p>
            <div>
              <Button
                variant="ghost"
                onClick={handleRetry}
                className="w-fit text-destructive hover:text-destructive"
              >
                Réessayer le chargement
              </Button>
            </div>
          </div>
        )}

        <ResultsPageClient
          seasons={seasons}
          isLoading={isLoading}
          isInitialLoading={isInitialLoading}
        />

        {!isInitialLoading && (
          <div className="flex justify-center">
            {hasMore ? (
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="min-w-[200px]"
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
              </Button>
            ) : (
              seasons.length > 0 && (
                <p className="text-sm text-muted-foreground">
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
