import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";
import { RaceResultsTable } from "@/components/race/RaceResultTable";
import { StandingsPreview } from "@/components/home/StandingsPreview";

export default function HomePage() {
  return (
    <>
      <NextRaceCountdown />
      <UpcomingRaces />
      <RaceResultsTable round="last" title="Résultats dernière course" />
      <StandingsPreview />
    </>
  );
}
