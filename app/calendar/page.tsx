import { getCalendar } from "@/features/calendar/getCalendar";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { getTimeUntilLabel, isPastRace } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { ViewToggle } from "@/components/calendar/ViewToggle";
import { MiniRaceCard } from "@/components/calendar/MiniRaceCard";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { season?: string; view?: string };
}) {
  const season = searchParams.season || new Date().getFullYear().toString();
  const races = await getCalendar(season);
  const view = searchParams.view || "list";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Calendar />}
        title={`Calendrier ${season}`}
        description="Liste complète des courses de la saison sélectionnée"
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle />
            <SeasonSelect />
          </div>
        }
      />

      {view === "list" && (
        <div className="space-y-6">
          {races.map((race, i) => {
            const badge = getTimeUntilLabel(race.date);
            const flag = countryToFlagEmoji(
              race.location.split(", ").at(-1) || "",
            );

            return (
              <SectionCard
                key={i}
                title={`${flag} ${race.name}`}
                description={`${race.circuit} — ${new Date(race.date).toLocaleDateString("fr-FR")}`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground text-sm">
                    {race.location}
                  </p>
                  {badge && (
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-medium">
                        {isPastRace(race.date) ? (
                          <Link
                            href={`/results/${new Date(race.date).getFullYear()}/${String(i + 1) || "#"}`}
                          >
                            Voir les résultats -{">"}
                          </Link>
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
      )}

      {view === "grid" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((race, i) => (
            <MiniRaceCard key={i} race={{ ...race, round: String(i + 1) }} />
          ))}
        </div>
      )}

      {view === "timeline" && (
        <div className="relative border-l pl-4 space-y-6">
          {races.map((race, i) => {
            const badge = getTimeUntilLabel(race.date);
            const flag = countryToFlagEmoji(
              race.location.split(", ").at(-1) || "",
            );

            return (
              <div key={i} className="relative">
                <div className="absolute -left-2 top-1.5 w-3 h-3 rounded-full bg-primary" />
                <div className="ml-2">
                  <h4 className="font-semibold text-base">
                    {flag} {race.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {race.circuit} —{" "}
                    {new Date(race.date).toLocaleDateString("fr-FR")}
                  </p>
                  {badge && (
                    <span
                      className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
