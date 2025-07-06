"use client";

import { ResultsPageClient } from "@/app/results/ResultsPageClient";
import React, { useEffect, useState } from "react";
import { Season } from "@/entities/season/model";
import { Button } from "@/components/ui/button";
import { useSeasonWithRaceCount } from "@/features/results/hooks";

export default function ResultsIndexPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = async (pageToLoad: number) => {
    setIsLoading(true);
    const newSeasons = await useSeasonWithRaceCount(pageToLoad);
    setIsLoading(false);

    if (!newSeasons || newSeasons.length === 0) {
      setHasMore(false);
      return;
    }

    setSeasons((prev) => [...prev, ...newSeasons]);
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  };

  return (
    <div className="space-y-6">
      <ResultsPageClient seasons={seasons} />

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? "Chargement..." : "Charger plus"}
          </Button>
        </div>
      )}
    </div>
  );
}
