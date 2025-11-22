import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getConstructorColor } from "@/lib/utils/colors";
import { Badge } from "@/components/ui/badge";
import { clsx } from "clsx";

export const columnsRace = [
  { key: "position", label: "#" },
  {
    key: "driver",
    label: "Pilote",
    render: (
      driver: string,
      row: { driverNationality: string; position: string },
    ) => (
      <div className="flex items-center gap-2">
        {countryToFlagEmoji(row.driverNationality)} {driver}
        {row.position == "1" && (
          <Badge
            variant="secondary"
            className="text-xs bg-green-300 text-accent ml-2 animate-pulse cursor-pointer"
          >
            🏆 Vainqueur
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "constructor",
    label: "Écurie",
    render: (constructor: string) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: getConstructorColor(constructor),
          }}
        />
        {constructor}
      </div>
    ),
  },
  {
    key: "grid",
    label: "Grille",
    render: (grid: string, row: { position: string }) => {
      const gridNum = Number.isFinite(Number(grid)) ? parseInt(grid, 10) : NaN;
      const posNum = Number.isFinite(Number(row.position))
        ? parseInt(row.position, 10)
        : NaN;
      if (isNaN(gridNum) || isNaN(posNum))
        return <span className="text-muted-foreground">N/A</span>;
      const diff = gridNum - posNum;
      if (diff === 0) return String(gridNum);
      if (diff === 0) return grid;
      return (
        <div className="flex items-center gap-2">
          {grid}
          <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
            ({diff > 0 ? "+" + diff : diff})
          </span>
        </div>
      );
    },
  },
  { key: "time", label: "Temps" },
  {
    key: "points",
    label: "Points",
    render: (points: number) => <span className="font-bold">{points}</span>,
  },
  {
    key: "fastestLap",
    label: "Meilleur tour",
    render: (fastestLap: { time?: string; rank?: string }) => {
      const time = fastestLap?.time;
      if (!time)
        return <span className="text-sm text-muted-foreground">N/A</span>;
      return (
        <span
          className={clsx(
            fastestLap?.rank == "1" && "text-purple-500 font-bold",
            "text-sm font-mono text-muted-foreground",
          )}
        >
          {time}
        </span>
      );
    },
  },
];

export const columnsQualif = [
  { key: "position", label: "#" },
  { key: "driver", label: "Pilote" },
  {
    key: "constructor",
    label: "Écurie",
    render: (constructor: string) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: getConstructorColor(constructor),
          }}
        />
        {constructor}
      </div>
    ),
  },
  {
    key: "q1",
    label: "Q1",
    render: (q1: string, row: { bestTimes?: { q1: number | null } }) => {
      const normalize = (val?: string) =>
        val ? Number(val.replace(/[:.]/g, "")) : null;
      const isBest =
        row.bestTimes?.q1 !== null &&
        row.bestTimes?.q1 !== undefined &&
        normalize(q1) === row.bestTimes.q1;
      return (
        <span
          className={clsx(
            "font-mono text-sm text-muted-foreground",
            isBest && "text-purple-500 font-bold",
          )}
        >
          {q1 ?? "N/A"}
        </span>
      );
    },
  },
  {
    key: "q2",
    label: "Q2",
    render: (q2: string, row: { bestTimes?: { q2: number | null } }) => {
      const normalize = (val?: string) =>
        val ? Number(val.replace(/[:.]/g, "")) : null;
      const isBest =
        row.bestTimes?.q2 !== null &&
        row.bestTimes?.q2 !== undefined &&
        normalize(q2) === row.bestTimes.q2;
      return (
        <span
          className={clsx(
            "font-mono text-sm text-muted-foreground",
            isBest && "text-purple-500 font-bold",
          )}
        >
          {q2 ?? "N/A"}
        </span>
      );
    },
  },
  {
    key: "q3",
    label: "Q3",
    render: (q3: string, row: { bestTimes?: { q3: number | null } }) => {
      const normalize = (val?: string) =>
        val ? Number(val.replace(/[:.]/g, "")) : null;
      const isBest =
        row.bestTimes?.q3 !== null &&
        row.bestTimes?.q3 !== undefined &&
        normalize(q3) === row.bestTimes.q3;
      return (
        <span
          className={clsx(
            "font-mono text-sm text-muted-foreground",
            isBest && "text-purple-500 font-bold",
          )}
        >
          {q3 ?? "N/A"}
        </span>
      );
    },
  },
];

export const columnsSprint = [
  { key: "position", label: "#" },
  {
    key: "driver",
    label: "Pilote",
    render: (driver: string, row: { grid: string }) => (
      <div className="flex items-center gap-2">
        {driver}{" "}
        {row.grid == "1" && (
          <Badge
            variant="secondary"
            className="text-xs bg-green-300 text-accent ml-2 animate-pulse cursor-pointer"
          >
            🏆 Vainqueur
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "constructor",
    label: "Écurie",
    render: (constructor: string) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: getConstructorColor(constructor),
          }}
        />
        {constructor}
      </div>
    ),
  },
  {
    key: "grid",
    label: "Grille",
    render: (grid: string, row: { position: string }) => {
      const gridNum = Number.isFinite(Number(grid)) ? parseInt(grid, 10) : NaN;
      const posNum = Number.isFinite(Number(row.position))
        ? parseInt(row.position, 10)
        : NaN;
      if (isNaN(gridNum) || isNaN(posNum))
        return <span className="text-muted-foreground">N/A</span>;
      const diff = gridNum - posNum;
      if (diff === 0) return String(gridNum);
      if (diff === 0) return grid;
      return (
        <div className="flex items-center gap-2">
          {grid}
          <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
            ({diff > 0 ? "+" + diff : diff})
          </span>
        </div>
      );
    },
  },
  { key: "time", label: "Temps" },
  {
    key: "points",
    label: "Points",
    render: (points: number) => <span className="font-bold">{points}</span>,
  },
];
