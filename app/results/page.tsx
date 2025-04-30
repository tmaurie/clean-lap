"use client";

import { ResultsPageClient } from "@/app/results/ResultsPageClient";
import React, { useEffect, useState } from "react";
import { useSeasonWithRaceCount } from "@/features/results/hooks";

export default function ResultsIndexPage() {
  const [seasons, setSeasons] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchRaces() {
      const data = await useSeasonWithRaceCount();
      setSeasons(data);
    }
    fetchRaces();
  }, []);

  if (!seasons) {
    return <div>Chargement des résultats...</div>;
  }

  return <ResultsPageClient seasons={seasons} />;
}
