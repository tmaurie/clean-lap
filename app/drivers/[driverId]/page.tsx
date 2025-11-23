import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart2,
  Gauge,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { DotPattern } from "@/components/magicui/dot-pattern";
import { ResultTable } from "@/app/results/ResultTable";
import { columnsDriverSeason } from "@/lib/config/columns";
import { fetchDriverSeason } from "@/lib/api/drivers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countryToFlagEmoji } from "@/lib/utils/flags";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border bg-card/70 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">
        {value ?? "N/A"}
      </div>
    </div>
  );
}

export default async function DriverPage({
  params,
  searchParams,
}: {
  params: { driverId: string };
  searchParams: { season?: string };
}) {
  const season = searchParams?.season ?? "current";
  const data = await fetchDriverSeason(params.driverId, season);

  if (!data) return notFound();

  const { driver, stats, races } = data;
  const flag = driver.nationality ? countryToFlagEmoji(driver.nationality) : "";

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-transparent">
        <DotPattern className="text-primary/40 [mask-image:radial-gradient(circle_at_top,white,transparent_65%)]" />
        <div className="relative grid gap-8 px-6 py-12 md:grid-cols-[2fr_3fr] md:px-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Button asChild variant="ghost" size="sm" className="gap-2 px-0">
                <Link href="/drivers">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Retour aux
                  pilotes
                </Link>
              </Button>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {season === "current" ? "Saison en cours" : `Saison ${season}`}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-4xl">{flag}</span> {driver.name}{" "}
              {driver.surname}
            </h1>
            <p className="text-muted-foreground">
              Nationalité : {driver.nationality ?? "N/A"} • Numéro{" "}
              {driver.number ?? "?"} • {driver.shortName ?? driver.id}
            </p>
            <div className="flex flex-wrap gap-3">
              {driver.url && (
                <Button asChild size="sm">
                  <a href={driver.url} target="_blank" rel="noreferrer">
                    Page Wikipedia
                    <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Points" value={stats.points} icon={BarChart2} />
            <StatCard label="Victoires" value={stats.wins} icon={Trophy} />
            <StatCard
              label="Moyenne grille"
              value={stats.avgGrid ?? "N/A"}
              icon={Gauge}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Résumé de la saison
            </h2>
            <p className="text-muted-foreground">
              Résultats course par course et points cumulés.
            </p>
          </div>
          <div className="flex gap-2">
            {/* Quick season selector via query params */}
            <Button asChild variant="outline" size="sm">
              <Link href={`/drivers/${driver.id}?season=current`}>
                Saison en cours
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/drivers/${driver.id}?season=2024`}>2024</Link>
            </Button>
          </div>
        </div>
        <ResultTable data={races} columns={columnsDriverSeason} />
      </section>
    </div>
  );
}
