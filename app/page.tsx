import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";
import { RaceResultsTable } from "@/components/home/RaceResultTable";
import { StandingsPreview } from "@/components/home/StandingsPreview";
import { SectionCard } from "@/components/ui/section-card";

export default function HomePage() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 grid-flow-row-dense auto-rows-auto gap-6">
      <SectionCard
        title="Prochaine course"
        icon="⏳"
        description="Prochaine course de la saison"
      >
        <NextRaceCountdown />
      </SectionCard>
      <SectionCard
        title="Dernière course"
        description="Résultats de la dernière course"
        icon="🏁"
      >
        <RaceResultsTable
          season={new Date().getFullYear().toString()}
          round="last"
        />
      </SectionCard>
      <SectionCard
        title="Courses à venir"
        icon="📆"
        description="Calendrier des courses de la saison"
      >
        <UpcomingRaces />
      </SectionCard>
      <SectionCard
        title="Classement"
        icon="🏆"
        description={`Classement pilotes et écuries de la saison ${new Date().getFullYear()}`}
      >
        <StandingsPreview />
      </SectionCard>
    </section>
  );
}
