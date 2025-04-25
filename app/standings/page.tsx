"use client";

import { StandingsTabs } from "@/components/standings/StandingsTabs";
import { PageHeader } from "@/components/ui/page-header";
import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { useState } from "react";

export default function StandingsPage() {
  const [season, setSeason] = useState(new Date().getFullYear().toString());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classements"
        description={`Saison ${season}`}
        actions={<SeasonSelect value={season} action={setSeason} />}
      />
      <StandingsTabs season={season} />
    </div>
  );
}
