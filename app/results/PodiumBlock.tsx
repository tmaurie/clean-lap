import { getConstructorColor } from "@/lib/utils/colors";
import { RaceResult } from "@/entities/race/model";

type Props = {
  results: RaceResult[];
};

export function PodiumBlock({ results }: Props) {
  const podium = results.slice(0, 3);

  if (podium.length < 3) return null;

  return (
    <div className="flex justify-center gap-6 items-end text-sm">
      {podium.map((r, i) => {
        const height = i === 0 ? "h-24" : i === 1 ? "h-20" : "h-16";
        const place = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
        const color = getConstructorColor(r.constructor);

        return (
          <div key={r.driver} className="flex flex-col items-center w-auto">
            <div
              className={`w-24 ${height} rounded-t-md`}
              style={{ backgroundColor: color }}
              title={r.constructor}
            />
            <p className="font-semibold mt-1 text-center">{r.driver}</p>
            <p className="text-xs text-muted-foreground">
              {place} {r.points} pts
            </p>
          </div>
        );
      })}
    </div>
  );
}
