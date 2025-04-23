import { getCalendar } from "@/features/calendar/getCalendar";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { getTimeUntilLabel, isPastRace } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { season?: string };
}) {
  const season = searchParams.season || new Date().getFullYear().toString();
  const races = await getCalendar(season);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Calendar />}
        title={`Calendrier ${season}`}
        description="Liste complète des courses de la saison sélectionnée"
        actions={<SeasonSelect />}
      />

      {races.map((race, i) => {
        const badge = getTimeUntilLabel(race.date);
        const flag = countryToFlagEmoji(race.location.split(", ").at(-1) || "");

        return (
          <SectionCard
            key={i}
            title={`${flag} ${race.name}`}
            description={`${race.circuit} — ${new Date(race.date).toLocaleDateString("fr-FR")}`}
          >
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground text-sm">{race.location}</p>
              {badge && (
                <div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium">
                    {isPastRace(race.date) ? (
                      <Link href="/results">Voir les résultats -{">"}</Link>
                    ) : (
                      ""
                    )}
                  </span>
                </div>
              )}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
