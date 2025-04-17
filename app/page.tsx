import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";

export default function HomePage() {
  return (
    <>
      <NextRaceCountdown />

      <section className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2">
        <UpcomingRaces />
      </section>
    </>
  );
}
