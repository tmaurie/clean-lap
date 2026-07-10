import Link from "next/link";
import { clsx } from "clsx";

import { PodiumBlock } from "@/app/results/PodiumBlock";
import { ResultTable } from "@/app/results/ResultTable";
import { getRaceResults, getRacesWithWinner } from "@/features/results/hooks";
import {
  fetchFreePracticeResults,
  fetchQualifyingResults,
  fetchRaceSchedule,
  fetchSprintResults,
} from "@/lib/api/race";
import {
  columnsQualif,
  columnsRace,
  columnsSprint,
  columnsFreePractice,
} from "@/lib/config/columns";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { GhostNumber } from "@/components/paddock/GhostNumber";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ResultsPage({ params }: any) {
  const { season, round } = await params;

  const [
    raceResult,
    scheduleData,
    sprintResults,
    qualifyingResults,
    fp1Results,
    fp2Results,
    fp3Results,
    seasonRaces,
  ] = await Promise.all([
    getRaceResults(season, round),
    fetchRaceSchedule(season, round),
    fetchSprintResults(season, round),
    fetchQualifyingResults(season, round),
    fetchFreePracticeResults(season, round, "fp1"),
    fetchFreePracticeResults(season, round, "fp2"),
    fetchFreePracticeResults(season, round, "fp3"),
    round !== "last" ? getRacesWithWinner(season) : Promise.resolve([]),
  ]);

  const { raceName, location, date, results, circuit } = raceResult;
  const circuitDetails = scheduleData?.circuitDetails;

  const country = location.split(", ").at(-1) || "";
  const flag = countryToFlagEmoji(country);

  const roundNum = Number(round);
  const prevRace = seasonRaces.find((r) => Number(r.round) === roundNum - 1);
  const nextRace = seasonRaces.find((r) => Number(r.round) === roundNum + 1);

  const fastestLapEntry = results.find(
    (r) => r.fastestLap?.rank === "1" && r.fastestLap?.time,
  );
  const fastestLap = fastestLapEntry?.fastestLap
    ? { time: fastestLapEntry.fastestLap.time, driver: fastestLapEntry.driver }
    : null;

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasSprint = sprintResults.results.length > 0;
  const tabCount = (hasSprint ? 3 : 2) + 3;
  const tabsGridCols = tabCount === 6 ? "grid-cols-6" : "grid-cols-5";

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-foreground/50">
          <Link href="/results" className="hover:text-foreground">
            Résultats
          </Link>
          <span>/</span>
          <Link href={`/results/${season}`} className="hover:text-foreground">
            {season}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            Manche {round === "last" ? "précédente" : round}
          </span>
        </div>
        <div className="flex gap-px border border-white/8 bg-white/8">
          <Link
            href={prevRace ? `/results/${season}/${prevRace.round}` : "#"}
            aria-disabled={!prevRace}
            className={clsx(
              "inline-flex items-center gap-2 bg-background px-4.5 py-2.5 text-xs font-bold uppercase tracking-widest",
              prevRace
                ? "text-foreground/70 hover:bg-[#12151a] hover:text-foreground"
                : "pointer-events-none text-foreground/25",
            )}
          >
            {prevRace ? `← R${prevRace.round} ${prevRace.name}` : "← —"}
          </Link>
          <Link
            href={nextRace ? `/results/${season}/${nextRace.round}` : "#"}
            aria-disabled={!nextRace}
            className={clsx(
              "inline-flex items-center gap-2 bg-background px-4.5 py-2.5 text-xs font-bold uppercase tracking-widest",
              nextRace
                ? "text-foreground/70 hover:bg-[#12151a] hover:text-foreground"
                : "pointer-events-none text-foreground/25",
            )}
          >
            {nextRace ? `R${nextRace.round} ${nextRace.name} →` : "— →"}
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12">
        <HatchOverlay />
        <GhostNumber className="left-6 -bottom-8 text-[220px] md:left-12">
          R{round === "last" ? "" : round}
        </GhostNumber>
        <div className="relative flex flex-wrap items-end justify-between gap-10">
          <div className="flex flex-col gap-5">
            <SectionEyebrow>
              {round === "last" ? "Manche précédente" : `Manche ${round}`} —{" "}
              {formattedDate}
            </SectionEyebrow>
            <h1 className="max-w-3xl text-5xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              {raceName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
              <span className="font-semibold">
                {flag} {circuit.name}
              </span>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-px border border-white/8 bg-white/8">
            {circuitDetails?.circuitLength && (
              <div className="flex flex-col gap-1 bg-background px-6 py-4">
                <span className="text-2xl font-extrabold leading-none">
                  {circuitDetails.circuitLength}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                  Longueur circuit
                </span>
              </div>
            )}
            {fastestLap?.time && (
              <div className="flex flex-col gap-1 bg-background px-6 py-4">
                <span className="text-2xl font-extrabold leading-none text-primary">
                  {fastestLap.time}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">
                  Meilleur tour
                  {fastestLap.driver ? ` · ${fastestLap.driver}` : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 border-b border-border sm:grid-cols-3">
        <PodiumBlock results={results} />
      </section>

      <section className="flex flex-col gap-6 px-6 py-10 md:px-12">
        <div className="flex items-baseline justify-between">
          <SectionEyebrow>
            Classement de la course — {results.length} partants
          </SectionEyebrow>
        </div>

        <Tabs defaultValue="results">
          <TabsList
            className={clsx(
              "grid w-full gap-px border border-white/8 bg-white/8",
              tabsGridCols,
            )}
          >
            <TabsTrigger
              value="results"
              className="rounded-none bg-background font-mono text-xs uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Course
            </TabsTrigger>
            <TabsTrigger
              hidden={!hasSprint}
              value="sprint"
              className="rounded-none bg-background font-mono text-xs uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Sprint
            </TabsTrigger>
            <TabsTrigger
              value="qualif"
              className="rounded-none bg-background font-mono text-xs uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Qualifications
            </TabsTrigger>
            <TabsTrigger
              value="fp1"
              className="rounded-none bg-background font-mono text-xs uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              FP1
            </TabsTrigger>
            <TabsTrigger
              value="fp2"
              className="rounded-none bg-background font-mono text-xs uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              FP2
            </TabsTrigger>
            <TabsTrigger
              value="fp3"
              className="rounded-none bg-background font-mono text-xs uppercase tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              FP3
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-6">
            <ResultTable data={results} columns={columnsRace} />
          </TabsContent>
          <TabsContent value="sprint" className="mt-6">
            {!hasSprint ? (
              <div className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
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
              <div className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
                Pas de qualifications disponibles.
              </div>
            ) : (
              <ResultTable
                data={qualifyingResults.results}
                columns={columnsQualif}
              />
            )}
          </TabsContent>
          <TabsContent value="fp1" className="mt-6">
            {fp1Results.results.length === 0 ? (
              <div className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
                Pas de données pour la FP1.
              </div>
            ) : (
              <ResultTable
                data={fp1Results.results}
                columns={columnsFreePractice}
              />
            )}
          </TabsContent>
          <TabsContent value="fp2" className="mt-6">
            {fp2Results.results.length === 0 ? (
              <div className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
                Pas de données pour la FP2.
              </div>
            ) : (
              <ResultTable
                data={fp2Results.results}
                columns={columnsFreePractice}
              />
            )}
          </TabsContent>
          <TabsContent value="fp3" className="mt-6">
            {fp3Results.results.length === 0 ? (
              <div className="border border-dashed border-white/15 p-6 text-sm text-foreground/50">
                Pas de données pour la FP3.
              </div>
            ) : (
              <ResultTable
                data={fp3Results.results}
                columns={columnsFreePractice}
              />
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
