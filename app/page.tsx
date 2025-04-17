import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";
import { RaceResultsTable } from "@/components/race/RaceResultTable";
import { StandingsPreview } from "@/components/home/StandingsPreview";

export default function HomePage() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense auto-rows-auto gap-6">
      <NextRaceCountdown />
      <RaceResultsTable round="last" title="Résultats dernière course" />
      <UpcomingRaces />
      <StandingsPreview />
    </section>
  );
}
