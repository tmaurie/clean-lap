import { nationalityToFlagEmoji } from "@/lib/utils/flags";
import { getConstructorColor } from "@/components/ui/colors";
import { Badge } from "@/components/ui/badge";
import { clsx } from "clsx";

export const columnsRace = [
  { key: "position", label: "#" },
  {
    key: "driver",
    label: "Pilote",
    render: (
      driver: string,
      row: { driverNationality: string; grid: string },
    ) => (
      <div className="flex items-center gap-2">
        {nationalityToFlagEmoji(row.driverNationality)} {driver}
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
      const diff = parseInt(grid) - parseInt(row.position);
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
  { key: "laps", label: "Tours" },
  { key: "time", label: "Temps" },
  {
    key: "points",
    label: "Points",
    render: (points: number) => <span className="font-bold">{points}</span>,
  },
  {
    key: "fastestLap",
    label: "Meilleur tour",
    render: (
      fastestLap: { time?: string; rank?: string },
      row: { fastestLap: { time: string } },
    ) => {
      if (!fastestLap.time)
        return <span className="text-sm text-muted-foreground">N/A</span>;
      return (
        <span
          className={clsx(
            fastestLap?.rank == "1" && "text-purple-500 font-bold",
            "text-sm font-mono text-muted-foreground",
          )}
        >
          {row.fastestLap.time}
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
    render: (q1: string) => (
      <span className="font-mono text-sm text-muted-foreground">{q1}</span>
    ),
  },
  {
    key: "q2",
    label: "Q2",
    render: (q2: string) => (
      <span className="font-mono text-sm text-muted-foreground">{q2}</span>
    ),
  },
  {
    key: "q3",
    label: "Q3",
    render: (q3: string) => (
      <span className="font-mono text-sm text-muted-foreground">{q3}</span>
    ),
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
      const diff = parseInt(grid) - parseInt(row.position);
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
  { key: "laps", label: "Tours" },
  { key: "time", label: "Temps" },
  {
    key: "points",
    label: "Points",
    render: (points: number) => <span className="font-bold">{points}</span>,
  },
];
