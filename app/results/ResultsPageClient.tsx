"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { getConstructorColor } from "@/lib/utils/colors";
import { nationalityToFlagEmoji } from "@/lib/utils/flags";

type Season = {
  season: string;
  raceCount: number;
  driverChampion?: { name: string; nationality: string };
  constructorChampion?: string;
};

export function ResultsPageClient({ seasons }: { seasons: Season[] }) {
  const [visible, setVisible] = useState(10);

  const loadMore = () => {
    setVisible((prev) => prev + 10);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historique des résultats"
        description="Choisissez une saison pour explorer les résultats"
      />

      <ul className="space-y-2">
        {seasons.slice(0, visible).map((s) => (
          <li key={s.season}>
            <Link
              href={`/results/${s.season}`}
              className="flex justify-between items-start gap-4 px-4 py-3 rounded-md border hover:bg-muted transition"
            >
              <div>
                <p className="font-medium text-lg">{s.season}</p>
                <p className="text-sm text-muted-foreground">
                  {s.raceCount} Grands Prix
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground space-y-0.5">
                {s.driverChampion && (
                  <p>
                    🏆 {nationalityToFlagEmoji(s.driverChampion.nationality)}{" "}
                    {s.driverChampion.name}
                  </p>
                )}
                {s.constructorChampion && (
                  <div className="flex justify-end items-center gap-1">
                    🚘
                    <span
                      className="px-2 py-0.5 text-xs rounded-full text-white"
                      style={{
                        backgroundColor: getConstructorColor(
                          s.constructorChampion,
                        ),
                      }}
                    >
                      {s.constructorChampion}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {visible < seasons.length && (
        <div className="pt-4 text-center">
          <Button variant="outline" onClick={loadMore}>
            Charger plus
          </Button>
        </div>
      )}
    </div>
  );
}
