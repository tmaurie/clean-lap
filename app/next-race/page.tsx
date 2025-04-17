"use client";

import { useNextRace } from "@/features/nextRace";
import { Suspense } from "react";
import { RaceCountdown } from "@/components/RaceCountdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NextRacePage() {
  return (
    <main className="p-6">
      <Suspense fallback={<p>Chargement...</p>}>
        <RaceDetails />
      </Suspense>
    </main>
  );
}

function RaceDetails() {
  const { data: race, isLoading } = useNextRace();

  if (isLoading) return <p>Chargement...</p>;
  if (!race) return <p>Aucune course trouvée.</p>;

  return (
    <>
      <Card className="w-full max-w-xl  bg-card border border-muted">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            🏁 Prochaine course
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>
              <strong>Circuit :</strong> {race.circuit} ({race.location})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>📆</span>
            <span>
              <strong>Date :</strong> {new Date(race.date).toLocaleDateString()}{" "}
              à {race.time.slice(0, 5)} UTC
            </span>
          </div>

          <div className="mt-4">
            <RaceCountdown date={race.date} time={race.time} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
