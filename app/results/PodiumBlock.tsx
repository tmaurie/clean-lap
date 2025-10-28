import { clsx } from "clsx";

import { RaceResult } from "@/entities/race/model";
import { getConstructorColor } from "@/lib/utils/colors";

type Props = {
  results: RaceResult[];
};

export function PodiumBlock({ results }: Props) {
  const podium = results.slice(0, 3);

  if (podium.length < 3) return null;

  const places = [
    { label: "🥇 Vainqueur", emphasis: "text-primary" },
    { label: "🥈 Deuxième", emphasis: "text-muted-foreground" },
    { label: "🥉 Troisième", emphasis: "text-muted-foreground" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {podium.map((result, index) => {
        const accent = getConstructorColor(result.constructor);

        return (
          <div
            key={result.driver}
            className={clsx(
              "relative overflow-hidden rounded-2xl border border-primary/20 bg-background/90 p-6 text-sm shadow-sm transition-transform backdrop-blur",
              index === 0 ? "sm:-translate-y-2 sm:scale-[1.02]" : "sm:translate-y-2",
            )}
          >
            <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              <span className={clsx("font-semibold", places[index].emphasis)}>
                {places[index].label}
              </span>
              <span className="font-semibold text-primary">{result.points} pts</span>
            </div>

            <div className="mt-6 space-y-1">
              <p className="text-lg font-semibold tracking-tight">{result.driver}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {result.constructor}
              </p>
            </div>

            <div
              className="mt-6 h-1.5 w-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
