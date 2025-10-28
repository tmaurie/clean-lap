import {
  ArrowUpRight,
  CalendarClock,
  Flag,
  MapPin,
  Timer,
  Trophy,
} from "lucide-react";

import { DotPattern } from "@/components/magicui/dot-pattern";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PodiumBlock } from "@/app/results/PodiumBlock";
import { ResultTable } from "@/app/results/ResultTable";
import { getRaceResults } from "@/features/results/hooks";
import { fetchQualifyingResults, fetchSprintResults } from "@/lib/api/race";
import {
  columnsQualif,
  columnsRace,
  columnsSprint,
} from "@/lib/config/columns";
import { isPastRace } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { clsx } from "clsx";

export default async function ResultsPage({ params }: any) {
  const { season, round } = await params;
  const { raceName, location, date, results, time, circuit } =
    await getRaceResults(season, round);

  const country = location.split(", ").at(-1) || "";
  const flag = countryToFlagEmoji(country);
  const circuitFlag = countryToFlagEmoji(circuit.country);
  const sprintResults = await fetchSprintResults(season, round);
  const qualifyingResults = await fetchQualifyingResults(season, round);

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(`${date}T${time}`).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const hasSprint = sprintResults.results.length > 0;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-transparent">
        <DotPattern className="text-primary/40 [mask-image:radial-gradient(circle_at_top,white,transparent_65%)]" />

        <div className="relative grid gap-10 px-6 py-12 md:grid-cols-[3fr_2fr] md:px-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Saison {season}
              </Badge>
              <Badge
                variant="outline"
                className="border-primary/40 text-primary"
              >
                Manche {round}
              </Badge>
              {isPastRace(date) && (
                <Badge
                  variant="outline"
                  className="border-green-500/40 text-green-500"
                >
                  Course passée
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="text-4xl">{flag}</span> {raceName}
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                Revivez le week-end du Grand Prix avec les classements complets,
                le podium et les détails du circuit.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border bg-card/60 p-4 backdrop-blur">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-card/60 p-4 backdrop-blur">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-card/60 p-4 backdrop-blur sm:col-span-2">
                <Timer className="h-4 w-4 text-primary" aria-hidden />
                <span>Départ à {formattedTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <a
                  href={`https://en.wikipedia.org/wiki/${raceName.replace(/ /g, "_")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Page Wikipedia
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-primary/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flag className="h-5 w-5 text-primary" aria-hidden />
                Circuit {circuit.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="text-base">{circuitFlag}</span>
                {circuit.locality}, {circuit.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-muted-foreground">
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
                <p>
                  Un tracé emblématique qui accueille la Formule 1 depuis des
                  décennies. Consultez les informations officielles du circuit
                  pour préparer votre analyse.
                </p>
              </div>
              <Button asChild variant="secondary" className="w-full">
                <a href={circuit.url} target="_blank" rel="noreferrer">
                  Voir la fiche circuit
                  <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Résultats du week-end
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Basculez entre course, sprint et qualifications pour analyser les
            performances des pilotes et des écuries.
          </p>
        </div>

        <Card className="border-primary/20 bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" aria-hidden />
              Classements détaillés
            </CardTitle>
            <CardDescription>
              Les résultats officiels fournis par la FIA, mis en forme pour un
              décryptage rapide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results">
              <TabsList
                className={clsx(
                  "grid w-full gap-2 bg-muted/40 p-1 text-muted-foreground",
                  hasSprint ? "grid-cols-3" : "grid-cols-2",
                )}
              >
                <TabsTrigger
                  value="results"
                  className="data-[state=active]:bg-background"
                >
                  Course
                </TabsTrigger>
                <TabsTrigger
                  hidden={!hasSprint}
                  value="sprint"
                  className="data-[state=active]:bg-background"
                >
                  Sprint
                </TabsTrigger>
                <TabsTrigger
                  value="qualif"
                  className="data-[state=active]:bg-background"
                >
                  Qualifs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="mt-6 space-y-6">
                <PodiumBlock results={results} />
                <ResultTable data={results} columns={columnsRace} />
              </TabsContent>
              <TabsContent value="sprint" className="mt-6">
                {!hasSprint ? (
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
                    Pas de sprint pour ce Grand Prix.
                  </div>
                ) : (
                  <ResultTable
                    data={sprintResults.results}
                    columns={columnsSprint}
                  />
                )}
              </TabsContent>

              <TabsContent value="qualif" className="mt-6">
                {!qualifyingResults ? (
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-sm text-muted-foreground">
                    Pas de qualifications disponibles.
                  </div>
                ) : (
                  <ResultTable
                    data={qualifyingResults.results}
                    columns={columnsQualif}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
