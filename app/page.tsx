import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";
import { LastRaceResults } from "@/components/home/LastRaceResults";

export default function HomePage() {
  return (
    <>
      <NextRaceCountdown />

      <UpcomingRaces />

      <LastRaceResults />
    </>
  );
}
