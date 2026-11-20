import type { Season } from "@/entities/season/model";
import { cleanLapDriverId } from "./ids";
import type { ApiCircuit, ApiTeam } from "./types";
import reference from "./data/f1db-reference.json";

type RaceReference = {
  circuitLength?: number | null;
  corners?: number | null;
  winner?: {
    name: string;
    surname: string;
    teamName: string;
    teamId?: string | null;
  };
};

export const archivedSeasons: Partial<Record<string, Season>> =
  reference.seasons;
const circuits: Partial<Record<string, ApiCircuit>> = reference.circuits;
const teams: Partial<Record<string, ApiTeam>> = reference.teams;
const races: Partial<Record<string, RaceReference>> = reference.races;

export function circuitReference(id: string) {
  const circuit = circuits[id];
  return circuit?.fastestLapDriverId
    ? {
        ...circuit,
        fastestLapDriverId: cleanLapDriverId(circuit.fastestLapDriverId),
      }
    : circuit;
}

export function teamReference(id: string) {
  return teams[id];
}

export function raceReference(date: string, circuit: string) {
  return races[`${date}/${circuit}`];
}

const demonyms: Partial<Record<string, string | null>> = reference.countries;

export function countryCodeToDemonym(code?: string): string | undefined {
  return code ? (demonyms[code] ?? undefined) : undefined;
}

type PracticeRow = [
  position: string | null,
  driver: string,
  nationality: string,
  team: string | null,
  time: string | null,
];

export async function practiceReference(
  date: string,
  circuit: string,
  session: string,
) {
  const { default: data } = await import("./data/f1db-practice.json");
  const archive: Partial<Record<string, (string | null)[][]>> = data;
  return (archive[`${date}/${circuit}/${session}`] ?? []).flatMap(
    ([position, driver, nationality, team, time]): PracticeRow[] =>
      driver ? [[position, driver, nationality ?? "", team, time]] : [],
  );
}
