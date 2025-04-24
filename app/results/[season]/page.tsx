import {PageHeader} from "@/components/ui/page-header";
import Link from "next/link";
import {countryToFlagEmoji} from "@/lib/utils/flags";
import {useRacesWithWinner} from "@/features/results/hooks";

export default async function SeasonResultsPage({
  params,
}: {
  params: { season: string };
}) {
  const races = await useRacesWithWinner(params.season);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Résultats ${params.season}`}
        description="Cliquez sur une course pour voir les détails"
      />

      <ul className="space-y-2">
        {races.map((race) => {
          const flag = countryToFlagEmoji(
            race.location.split(", ").at(-1) || "",
          );

          return (
            <li key={race.round}>
              <Link
                href={`/results/${params.season}/${race.round}`}
                className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 rounded-md border hover:bg-muted transition"
              >
                <div>
                  <p className="font-medium">
                    {flag} {race.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {race.location} –{" "}
                    {new Date(race.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                {race.winner && (
                  <span className="text-sm text-right text-muted-foreground mt-2 md:mt-0">
                    🏆 {race.winner}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
