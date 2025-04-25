import { StandingsTabs } from "@/components/standings/StandingsTabs";
import { PageHeader } from "@/components/ui/page-header";

export default function StandingsPage() {
  const season = new Date().getFullYear().toString();

  return (
    <div className="space-y-6">
      <PageHeader title="Classements" description={`Saison ${season}`} />
      <StandingsTabs season={season} />
    </div>
  );
}
