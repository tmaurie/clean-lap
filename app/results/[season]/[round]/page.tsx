import { PageHeader } from "@/components/ui/page-header";
import { fetchRaceResults } from "@/lib/api/race";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { isPastRace } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodiumBlock } from "@/app/results/PodiumBlock";

export default async function ResultsPage({
  params,
}: {
  params: { season: string; round: string };
}) {
  const { season, round } = await params;
  const { raceName, location, date, results } = await fetchRaceResults(
    season,
    round,
  );

  const country = location.split(", ").at(-1) || "";
  const flag = countryToFlagEmoji(country);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${flag} ${raceName}`}
        description={`${location} — ${new Date(date).toLocaleDateString("fr-FR")}`}
        actions={
          isPastRace(date) && <Badge variant="secondary">Course passée</Badge>
        }
      />

      <Tabs defaultValue="results" className="">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="sprint">Sprint</TabsTrigger>
          <TabsTrigger value="qualif">Qualifs</TabsTrigger>
          <TabsTrigger value="laps">Tours</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <PodiumBlock results={results} />
          <ul className="text-sm space-y-1">
            {results.slice(0, 5).map((r) => (
              <li key={r.position}>
                <strong>{r.position}.</strong> {r.driver} — {r.constructor} —{" "}
                {r.points} pts
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="sprint">
          <p className="text-muted-foreground text-sm">À venir...</p>
        </TabsContent>
        <TabsContent value="qualif">
          <p className="text-muted-foreground text-sm">À venir...</p>
        </TabsContent>
        <TabsContent value="laps">
          <p className="text-muted-foreground text-sm">À venir...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
