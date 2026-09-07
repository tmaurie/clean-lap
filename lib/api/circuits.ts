import { Circuit, CircuitRace } from "@/entities/circuit/model";
import { API_BASE_URL, fetchApi, fetchApiOrNull } from "@/lib/api/client";
import type {
  ApiCircuit,
  ApiCircuitResponse,
  ApiCircuitsResponse,
  ApiSeasonResponse,
} from "@/lib/api/types";
import {
  circuitLengthMeters,
  normalizeCircuit,
  toArray,
} from "@/lib/api/types";

function mapCircuit(circuit: ApiCircuit, fallbackId: string): Circuit {
  return {
    id: circuit.circuitId ?? fallbackId,
    name: circuit.circuitName ?? fallbackId,
    country: circuit.country ?? null,
    city: circuit.city ?? null,
    lengthMeters: circuitLengthMeters(circuit.circuitLength),
    // `corners` sur les endpoints saison, `numberOfCorners` sur /api/circuits.
    corners: circuit.numberOfCorners ?? circuit.corners ?? null,
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
  const json = await fetchApiOrNull<ApiCircuitResponse>(
    `${API_BASE_URL}/circuits/${circuitId}`,
  );
  // Cet endpoint renvoie `circuit` en tableau d'un élément, comme les écuries.
  const [circuit] = toArray(json?.circuit);
  return circuit ? mapCircuit(circuit, circuitId) : null;
}

/** Les circuits visités lors d'une saison. */
export async function fetchCircuitsForSeason(
  season: string,
): Promise<Circuit[]> {
  const json = await fetchApiOrNull<ApiCircuitsResponse>(
    `${API_BASE_URL}/${season}/circuits`,
    { season },
  );
  return (json?.circuits ?? []).map((circuit) =>
    mapCircuit(circuit, circuit.circuitId ?? ""),
  );
}

/**
 * La manche courue sur ce circuit lors d'une saison.
 *
 * Il n'existe pas d'endpoint « courses d'un circuit » : on lit le calendrier
 * de la saison, déjà en cache, et on y cherche le circuit. Un seul appel,
 * contre un par saison si on voulait tout l'historique.
 */
export async function fetchCircuitRace(
  circuitId: string,
  season: string,
): Promise<CircuitRace | null | undefined> {
  // `undefined` = calendrier indisponible, `null` = circuit absent de ce
  // calendrier. Sans cette distinction, un hoquet de l'API faisait afficher
  // « pas au calendrier » à tort — observé sur Monza 2020, qui y était bien.
  const json = await fetchApi<ApiSeasonResponse>(`${API_BASE_URL}/${season}`, {
    season,
  }).catch((error) => {
    console.warn(`[circuits] calendrier ${season} indisponible`, error);
    return undefined;
  });

  if (json === undefined) return undefined;

  const race = (json?.races ?? []).find(
    (r) => normalizeCircuit(r.circuit)?.circuitId === circuitId,
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
