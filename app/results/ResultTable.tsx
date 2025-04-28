import { getConstructorColor } from "@/components/ui/colors";
import { clsx } from "clsx";
import { RaceResult } from "@/entities/race/model";

export function ResultTable({ results }: { results: RaceResult[] }) {
  if (!results || results.length === 0) {
    return <div className="text-center p-4">Aucun résultat disponible</div>;
  }

  const gridResultDiff = (grid: string, position: string) => {
    const diff = parseInt(grid) - parseInt(position);
    if (diff > 0) {
      return <span className="text-green-400">(+{diff})</span>;
    } else if (diff < 0) {
      return <span className="text-red-400">({diff})</span>;
    }
    return null;
  };
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left px-3 py-2">#</th>
            <th className="text-left px-3 py-2">Pilote</th>
            <th className="text-left px-3 py-2">Écurie</th>
            <th className="text-left px-3 py-2">Grille</th>
            <th className="text-left px-3 py-2">Tours</th>
            <th className="text-left px-3 py-2">Temps</th>
            <th className="text-left px-3 py-2">Pts</th>
            <th className="text-left px-3 py-2">Meilleur tour</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isFastestLap = r.fastestLap?.rank == "1";
            const color = getConstructorColor(r.constructor);

            return (
              <tr
                key={r.position}
                className="border-t hover:bg-muted/40 transition-colors"
              >
                <td className="px-3 py-2 font-semibold">{r.position}</td>
                <td className="px-3 py-2">
                  {r.driver} {r.position === "1" && <span>🏆</span>}
                </td>
                <td className="px-3 py-2">
                  <span
                    className="inline-block w-2 h-2 mr-2 rounded-full align-middle"
                    style={{ backgroundColor: color }}
                  />
                  {r.constructor}
                </td>
                <td className="px-3 py-2">
                  {r.grid} {gridResultDiff(r.grid, r.position)}
                </td>
                <td className="px-3 py-2">{r.laps}</td>
                <td className="px-3 py-2">{r.time}</td>
                <td className="px-3 py-2 font-semibold ">{r.points}</td>
                <td
                  className={clsx(
                    "px-3 py-2",
                    isFastestLap && "font-black text-purple-400",
                  )}
                >
                  {r.fastestLap?.time}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
