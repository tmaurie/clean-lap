import { PageHeader } from "@/components/ui/page-header";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { isPastRace } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodiumBlock } from "@/app/results/PodiumBlock";
import { getRaceResults } from "@/features/results/hooks";
import { ResultTable } from "@/app/results/ResultTable";

export default async function ResultsPage({
  params,
}: {
  params: { season: string; round: string };
}) {
  const { season, round } = await params;
  const { raceName, location, date, results, time, circuit } =
    await getRaceResults(season, round);

  const country = location.split(", ").at(-1) || "";
  const flag = countryToFlagEmoji(country);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Résultats de la course"
        actions={
          isPastRace(date) && <Badge variant="secondary">Course passée</Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-md p-4">
        {/* Bloc Course */}
        <div className="space-y-2 flex flex-col justify-evenly items-center md:items-start ">
          <h2 className="text-xl font-bold">
            {flag} {raceName}
          </h2>
          <p className="text-sm text-muted-foreground">📍 {location}</p>
          <p className="text-sm text-muted-foreground">
            🗓️ {new Date(date).toLocaleDateString("fr-FR")} à{" "}
            {new Date(`${date}T${time}`).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <a
            href={`https://en.wikipedia.org/wiki/${raceName.replace(/ /g, "_")}`}
            className="text-sm underline text-primary hover:text-primary/80"
            target="_blank"
            rel="noreferrer"
          >
            Voir sur Wikipedia
          </a>
        </div>

        {/* Bloc Circuit */}
        <div className="space-y-2 flex flex-col justify-evenly items-center md:items-end">
          <h2 className="text-xl font-bold">🏎️ {circuit.name}</h2>
          <p className="text-sm text-muted-foreground">
            📍 {circuit.locality}, {circuit.country}
          </p>
          <a
            href={circuit.url}
            className="text-sm underline text-primary hover:text-primary/80"
            target="_blank"
            rel="noreferrer"
          >
            Détails du circuit
          </a>
        </div>
      </div>

      <Tabs defaultValue="results" className="">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="sprint">Sprint</TabsTrigger>
          <TabsTrigger value="qualif">Qualifs</TabsTrigger>
          <TabsTrigger value="laps">Tours</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <PodiumBlock results={results} />
          <ResultTable results={results} />
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
