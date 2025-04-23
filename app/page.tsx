import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";
import { RaceResultsTable } from "@/components/race/RaceResultTable";
import { StandingsPreview } from "@/components/home/StandingsPreview";
import { SectionCard } from "@/components/ui/section-card";
import { ChartNoAxesColumn, Flag } from "lucide-react";

export default function HomePage() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense auto-rows-auto gap-6">
      <NextRaceCountdown />
      <SectionCard
        title="Résultats dernière course"
        icon={<Flag className="w-4 h-4" />}
      >
        <RaceResultsTable
          season={new Date().getFullYear().toString()}
          round="last"
        />
      </SectionCard>
      <UpcomingRaces />
      <SectionCard
        title="Classement"
        icon={<ChartNoAxesColumn className="w-4 h-4" />}
        description={`Classement pilotes et écuries de la saison ${new Date().getFullYear()}`}
      >
        <StandingsPreview />
      </SectionCard>
    </section>
  );
}
