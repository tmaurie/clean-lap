import { Circuit, CircuitRace } from "@/entities/circuit/model";
import {
  jolpicaCalendarWithWinners,
  jolpicaCircuit,
  jolpicaCircuits,
} from "./jolpica";
import { cleanLapCircuitId } from "./ids";
import type { ApiCircuit } from "./types";

function mapCircuit(circuit: ApiCircuit, fallbackId: string): Circuit {
  return {
    id: circuit.circuitId ?? fallbackId,
    name: circuit.circuitName ?? fallbackId,
    country: circuit.country ?? null,
    city: circuit.city ?? null,
    lengthMeters: circuit.circuitLength ?? null,
    corners: circuit.corners ?? null,
    firstSeason: circuit.firstParticipationYear ?? null,
    url: circuit.url ?? null,
    lapRecord: circuit.lapRecord
      ? {
          time: circuit.lapRecord,
          driverId: circuit.fastestLapDriverId ?? null,
          teamId: circuit.fastestLapTeamId ?? null,
          year: circuit.fastestLapYear ?? null,
        }
      : null,
  };
}

/** Fiche d'un circuit. `null` s'il n'existe pas. */
export async function fetchCircuit(circuitId: string): Promise<Circuit | null> {
  const circuit = await jolpicaCircuit(circuitId);
  return circuit ? mapCircuit(circuit, circuitId) : null;
}

/** Les circuits visités lors d'une saison. */
export async function fetchCircuitsForSeason(
  season: string,
): Promise<Circuit[]> {
  return (await jolpicaCircuits(season)).map((circuit) =>
    mapCircuit(circuit, circuit.circuitId ?? ""),
  );
}

export async function fetchCircuitRace(
  circuitId: string,
  season: string,
): Promise<CircuitRace | null | undefined> {
  // `undefined` = calendrier indisponible, `null` = circuit absent de ce
  // calendrier. Sans cette distinction, un hoquet de l'API faisait afficher
  // « pas au calendrier » à tort — observé sur Monza 2020, qui y était bien.
  const races = await jolpicaCalendarWithWinners(season).catch((error) => {
    console.warn(`[circuits] calendrier ${season} indisponible`, error);
    return undefined;
  });

  if (races === undefined) return undefined;

  const race = races.find(
    (entry) => entry.circuit?.circuitId === cleanLapCircuitId(circuitId),
  );
  if (!race) return null;

  const round = Number(race.round);
  const winner = race.winner
    ? `${race.winner.name ?? ""} ${race.winner.surname ?? ""}`.trim()
    : null;

  return {
    round: Number.isFinite(round) ? round : null,
    name: race.raceName ?? "Grand Prix",
    date: race.schedule?.race?.date ?? race.date ?? null,
    winner: winner || null,
    winnerTeamId: race.teamWinner?.teamId ?? null,
  };
}
