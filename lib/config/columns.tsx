import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getConstructorColor } from "@/lib/utils/colors";
import { Badge } from "@/components/ui/badge";
import { clsx } from "clsx";
import type { ResultColumn } from "@/app/results/ResultTable";
import type { RaceResult } from "@/entities/race/model";
import type {
  FreePracticeResult,
  QualifyingResult,
  SprintResult,
} from "@/lib/api/race";

const renderPositionPodium = (position: string | number) => {
  if (position === undefined || position === null) {
    return <span className="font-mono text-sm text-muted-foreground">-</span>;
  }

  const posNum = Number(position);

  return (
    <span
      className={clsx(
        "text-lg font-black italic",
        posNum === 1 ? "text-primary" : "text-foreground/50",
      )}
    >
      {position}
    </span>
  );
};

const renderConstructor = (constructor: string) => (
  <div className="flex items-center gap-2">
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: getConstructorColor(constructor) }}
    />
    {constructor}
  </div>
);

const renderWinnerBadge = () => (
  <Badge
    variant="secondary"
    className="ml-2 rounded-none border-none bg-primary px-2 py-0.5 text-[0.7rem] font-bold uppercase italic text-primary-foreground"
  >
    🏆 Vainqueur
  </Badge>
);

const renderGridDelta = (grid: string, position: string) => {
  const gridNum = Number.isFinite(Number(grid)) ? parseInt(grid, 10) : NaN;
  const posNum = Number.isFinite(Number(position))
    ? parseInt(position, 10)
    : NaN;

  if (isNaN(gridNum) || isNaN(posNum)) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  const diff = gridNum - posNum;
  if (diff === 0) return String(gridNum);

  return (
    <div className="flex items-center gap-2">
      {grid}
      <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
        ({diff > 0 ? "+" + diff : diff})
      </span>
    </div>
  );
};

const renderSessionTime = (time: string | undefined, isFastest: boolean) => (
  <span
    className={clsx(
      "font-mono text-sm text-muted-foreground",
      isFastest && "text-purple-500 font-bold",
    )}
  >
    {time ?? "N/A"}
  </span>
);

export const columnsRace: ResultColumn<RaceResult>[] = [
  {
    key: "position",
    label: "#",
    render: (position) => renderPositionPodium(position),
  },
  {
    key: "driver",
    label: "Pilote",
    render: (driver, row) => (
      <div className="flex items-center gap-2">
        {countryToFlagEmoji(row.driverNationality ?? "")} {driver}
        {row.position === "1" && renderWinnerBadge()}
      </div>
    ),
  },
  {
    key: "constructor",
    label: "Écurie",
    render: (constructor) => renderConstructor(constructor),
  },
  {
    key: "grid",
    label: "Grille",
    render: (grid, row) => renderGridDelta(grid, row.position),
  },
  { key: "time", label: "Temps" },
  {
    key: "points",
    label: "Points",
    render: (points) => <span className="font-bold">{points}</span>,
  },
  {
    key: "fastestLap",
    label: "Meilleur tour",
    render: (fastestLap) => {
      if (!fastestLap?.time) {
        return <span className="text-sm text-muted-foreground">N/A</span>;
      }
      return (
        <span
          className={clsx(
            fastestLap.rank === "1" && "text-purple-500 font-bold",
            "text-sm font-mono text-muted-foreground",
          )}
        >
          {fastestLap.time}
        </span>
      );
    },
  },
];

export const columnsQualif: ResultColumn<QualifyingResult>[] = [
  {
    key: "position",
    label: "#",
    render: (position) => renderPositionPodium(position),
  },
  { key: "driver", label: "Pilote" },
  {
    key: "constructor",
    label: "Écurie",
    render: (constructor) => renderConstructor(constructor),
  },
  // Le meilleur temps de chaque session est résolu par la couche API
  // (isFastestQ1/2/3) : plus de re-parsing de chaînes de temps ici.
  {
    key: "q1",
    label: "Q1",
    render: (time, row) => renderSessionTime(time, row.isFastestQ1),
  },
  {
    key: "q2",
    label: "Q2",
    render: (time, row) => renderSessionTime(time, row.isFastestQ2),
  },
  {
    key: "q3",
    label: "Q3",
    render: (time, row) => renderSessionTime(time, row.isFastestQ3),
  },
];

export const columnsFreePractice: ResultColumn<FreePracticeResult>[] = [
  {
    key: "position",
    label: "#",
    render: (position) => renderPositionPodium(position),
  },
  {
    key: "driver",
    label: "Pilote",
    render: (driver, row) => (
      <div className="flex items-center gap-2">
        {row.driverNationality
          ? countryToFlagEmoji(row.driverNationality)
          : null}{" "}
        {driver}
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: getConstructorColor(row.constructor) }}
        />
      </div>
    ),
  },
  { key: "constructor", label: "Écurie" },
  {
    key: "time",
    label: "Temps",
    render: (time) => (
      <span className="font-mono text-sm text-muted-foreground">
        {time ?? "N/A"}
      </span>
    ),
  },
];

export const columnsSprint: ResultColumn<SprintResult>[] = [
  {
    key: "position",
    label: "#",
    render: (position) => renderPositionPodium(position),
  },
  {
    key: "driver",
    label: "Pilote",
    render: (driver, row) => (
      <div className="flex items-center gap-2">
        {driver} {row.position === "1" && renderWinnerBadge()}
      </div>
    ),
  },
  {
    key: "constructor",
    label: "Écurie",
    render: (constructor) => renderConstructor(constructor),
  },
  {
    key: "grid",
    label: "Grille",
    render: (grid, row) => renderGridDelta(grid, row.position),
  },
  { key: "time", label: "Temps" },
  {
    key: "points",
    label: "Points",
    render: (points) => <span className="font-bold">{points}</span>,
  },
];
