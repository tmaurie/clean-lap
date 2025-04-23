import { getTimeUntilLabel } from "@/lib/utils/date";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import Link from "next/link";
import { isPastRace } from "@/lib/utils/date";

type Props = {
  race: {
    name: string;
    date: string;
    time: string;
    circuit: string;
    location: string;
    round?: string;
  };
};

export function MiniRaceCard({ race }: Props) {
  const badge = getTimeUntilLabel(race.date);
  const flag = countryToFlagEmoji(race.location.split(", ").at(-1) || "");
  const past = isPastRace(race.date);

  return (
    <div className="rounded-md border bg-card p-4 shadow-sm flex flex-col gap-2 justify-between h-full">
      <div>
        <h4 className="text-sm font-semibold leading-tight">
          {flag} {race.name}
        </h4>
        <p className="text-xs text-muted-foreground">{race.circuit}</p>
        <p className="text-xs">
          {new Date(race.date).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2">
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        )}

        {past && (
          <span className="text-xs px-2 py-1 rounded-full font-medium">
            {isPastRace(race.date) ? (
              <Link href={`/results/${race.round || "#"}`}>
                Voir les résultats -{">"}
              </Link>
            ) : (
              ""
            )}
          </span>
        )}
      </div>
    </div>
  );
}
