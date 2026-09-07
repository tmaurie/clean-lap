import { DriverRaceResult, DriverSeason } from "@/entities/driver/model";

export type ComparisonMetric = {
  key: string;
  label: string;
  a: number | null;
  b: number | null;
  /** Pour la position au championnat ou la meilleure grille, le plus petit gagne. */
  lowerIsBetter?: boolean;
  /** Vainqueur de la ligne, `null` en cas d'égalité ou de donnée manquante. */
  winner: "a" | "b" | null;
};

export type HeadToHead = { a: number; b: number; rounds: number };

export type DriverComparison = {
  season: string;
  a: DriverSeason;
  b: DriverSeason;
  /** Duels en course et en qualification, sur les manches courues par les deux. */
  race: HeadToHead;
  qualifying: HeadToHead;
  metrics: ComparisonMetric[];
};

/**
 * Position exploitable, ou `null`.
 *
 * L'API renvoie aussi bien des nombres que `"NC"` (non classé) ou
 * `"not available"` : tout ce qui n'est pas un entier positif ne compte pas.
 */
function classified(value: DriverRaceResult["position"]): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function count(
  races: DriverRaceResult[],
  predicate: (race: DriverRaceResult) => boolean,
): number {
  return races.filter(predicate).length;
}

function best(values: (number | null)[]): number | null {
  const usable = values.filter((v): v is number => v !== null);
  return usable.length > 0 ? Math.min(...usable) : null;
}

function byRound(races: DriverRaceResult[]): Map<string, DriverRaceResult> {
  const map = new Map<string, DriverRaceResult>();
  for (const race of races) {
    if (race.round === null || race.round === undefined) continue;
    map.set(String(race.round), race);
  }
  return map;
}

/**
 * Duel sur les manches courues par les deux pilotes.
 *
 * On ne compte que les manches où les deux ont une position exploitable :
 * un abandon face à un abandon ne départage personne, et un pilote absent
 * ne doit pas offrir un point à l'autre.
 */
function headToHead(
  a: DriverRaceResult[],
  b: DriverRaceResult[],
  pick: (race: DriverRaceResult) => number | null,
): HeadToHead {
  const bByRound = byRound(b);
  let scoreA = 0;
  let scoreB = 0;
  let rounds = 0;

  for (const raceA of a) {
    if (raceA.round === null || raceA.round === undefined) continue;
    const raceB = bByRound.get(String(raceA.round));
    if (!raceB) continue;

    const valueA = pick(raceA);
    const valueB = pick(raceB);
    if (valueA === null || valueB === null) continue;

    rounds++;
    if (valueA < valueB) scoreA++;
    else if (valueB < valueA) scoreB++;
  }

  return { a: scoreA, b: scoreB, rounds };
}

function metric(
  key: string,
  label: string,
  a: number | null,
  b: number | null,
  lowerIsBetter = false,
): ComparisonMetric {
  let winner: "a" | "b" | null = null;
  if (a !== null && b !== null && a !== b) {
    const aWins = lowerIsBetter ? a < b : a > b;
    winner = aWins ? "a" : "b";
  }
  return { key, label, a, b, lowerIsBetter, winner };
}

/**
 * Compare deux saisons de pilotes.
 *
 * Tout est recalculé à partir de `/api/{saison}/drivers/{id}` plutôt que de
 * l'endpoint `/compare` de f1api.dev : celui-ci **intervertit les deux
 * pilotes**. Sur 2024, il attribue à Leclerc les 9 victoires et le titre de
 * Verstappen, et l'entrée `driverId1: "max_verstappen"` porte l'identité de
 * Leclerc (numéro 16, LEC, Ferrari). Les chiffres calculés ici concordent
 * avec le classement officiel.
 */
export function compareDrivers(
  season: string,
  a: DriverSeason,
  b: DriverSeason,
): DriverComparison {
  const wins = (races: DriverRaceResult[]) =>
    count(races, (r) => classified(r.position) === 1);
  const podiums = (races: DriverRaceResult[]) =>
    count(races, (r) => {
      const p = classified(r.position);
      return p !== null && p <= 3;
    });
  const poles = (races: DriverRaceResult[]) =>
    count(races, (r) => classified(r.grid) === 1);
  const inPoints = (races: DriverRaceResult[]) =>
    count(races, (r) => (Number(r.points) || 0) > 0);
  const dnfs = (races: DriverRaceResult[]) =>
    count(races, (r) => Boolean(r.status) || classified(r.position) === null);

  return {
    season,
    a,
    b,
    race: headToHead(a.races, b.races, (r) => classified(r.position)),
    qualifying: headToHead(a.races, b.races, (r) => classified(r.grid)),
    metrics: [
      metric("points", "Points", a.stats.points, b.stats.points),
      metric("wins", "Victoires", wins(a.races), wins(b.races)),
      metric("podiums", "Podiums", podiums(a.races), podiums(b.races)),
      metric("poles", "Pole positions", poles(a.races), poles(b.races)),
      metric(
        "pointFinishes",
        "Arrivées dans les points",
        inPoints(a.races),
        inPoints(b.races),
      ),
      metric(
        "bestFinish",
        "Meilleur résultat",
        best(a.races.map((r) => classified(r.position))),
        best(b.races.map((r) => classified(r.position))),
        true,
      ),
      metric(
        "bestGrid",
        "Meilleure grille",
        best(a.races.map((r) => classified(r.grid))),
        best(b.races.map((r) => classified(r.grid))),
        true,
      ),
      metric(
        "avgGrid",
        "Grille moyenne",
        a.stats.avgGrid,
        b.stats.avgGrid,
        true,
      ),
      // Moins d'abandons vaut mieux.
      metric("dnfs", "Abandons", dnfs(a.races), dnfs(b.races), true),
    ],
  };
}
