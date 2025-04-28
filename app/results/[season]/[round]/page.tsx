import { PageHeader } from "@/components/ui/page-header";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { isPastRace } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodiumBlock } from "@/app/results/PodiumBlock";
import { getRaceResults } from "@/features/results/hooks";
import { ResultTable } from "@/app/results/ResultTable";
import { fetchQualifyingResults, fetchSprintResults } from "@/lib/api/race";
import { clsx } from "clsx";
import {columnsQualif, columnsRace, columnsSprint} from "@/lib/config/columns";

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
  const sprintResults = await fetchSprintResults(season, round);
  const qualifyingResults = await fetchQualifyingResults(season, round);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Résultats de la course"
        actions={
          isPastRace(date) && <Badge variant="secondary">Course passée</Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-md p-4 bg-accent">
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

      <Tabs defaultValue="results">
        <TabsList
          className={clsx(
            sprintResults.results.length === 0 && "grid w-full grid-cols-2",
            sprintResults.results.length > 0 && "grid w-full grid-cols-3",
          )}
        >
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger
            hidden={sprintResults.results.length === 0}
            value="sprint"
          >
            Sprint
          </TabsTrigger>
          <TabsTrigger value="qualif">Qualifs</TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-col gap-4" value="results">
          <PodiumBlock results={results} />
          <ResultTable
            data={results}
            columns={columnsRace}
          />
        </TabsContent>
        <TabsContent hidden={sprintResults.results.length === 0} value="sprint">
          {sprintResults.results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pas de sprint pour ce Grand Prix.
            </p>
          ) : (
            <ResultTable
              data={sprintResults.results}
              columns={columnsSprint}
            />
          )}
        </TabsContent>

        <TabsContent value="qualif">
          {!qualifyingResults ? (
            <p className="text-sm text-muted-foreground">
              Pas de qualifications disponibles.
            </p>
          ) : (
            <ResultTable
              data={qualifyingResults.results}
              columns={columnsQualif}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
