import { unstable_cache } from "next/cache";

import { Race, RaceResult } from "@/entities/race/model";
import { fastestLapTimeMs, isFastestTime } from "@/lib/utils/time";
import {
  API_BASE_URL,
  fetchApi,
  fetchApiOrNull,
  isLiveSeason,
} from "@/lib/api/client";
import type {
  ApiFreePracticeResult,
  ApiQualyResult,
  ApiRace,
  ApiRaceResponse,
  ApiScheduleEntry,
  ApiSeasonResponse,
} from "@/lib/api/types";
import { normalizeCircuit } from "@/lib/api/types";

export type QualifyingResult = {
  position: string;
  driver: string;
  driverNationality?: string;
  constructor: string;
  grid: string;
  points: string;
  q1?: string;
  q2?: string;
  q3?: string;
  /**
   * Meilleur temps de la session, résolu ici plutôt que dans la couche de
   * rendu : les colonnes n'ont pas à re-parser des chaînes de temps.
   */
  isFastestQ1: boolean;
  isFastestQ2: boolean;
  isFastestQ3: boolean;
};

export type SprintResult = {
  position: string;
  driver: string;
  constructor: string;
  laps: string;
  grid: string;
  time: string;
  points: string;
};

export type FreePracticeResult = {
  position: string;
  driver: string;
  driverNationality?: string;
  constructor: string;
  time: string;
};

export type RaceSession = {
  date: string | null;
  time: string | null;
};

export type RaceSchedule = {
  fp1: RaceSession;
  fp2: RaceSession;
  fp3: RaceSession;
  qualy: RaceSession;
  sprintQualy: RaceSession;
  sprintRace: RaceSession;
  race: RaceSession;
};

export type RaceCircuitDetails = {
  name?: string | null;
  country?: string | null;
  city?: string | null;
  circuitLength?: string | null;
  lapRecord?: string | null;
  firstParticipationYear?: number | null;
  corners?: number | null;
  fastestLapDriverId?: string | null;
  fastestLapTeamId?: string | null;
  fastestLapYear?: number | null;
  url?: string | null;
};

function mapRace(race: ApiRace): Race {
  const circuit = normalizeCircuit(race.circuit);
  const location = [circuit?.city, circuit?.country].filter(Boolean).join(", ");

  const round = Number(race.round);

  return {
    round: Number.isFinite(round) ? round : null,
    // Valeurs de repli : le modèle promet des chaînes, l'API ne les garantit
    // pas. Sans elles on affichait « undefined » dans l'interface.
    name: race.raceName ?? "Grand Prix",
    date: race.schedule?.race?.date ?? race.date ?? "",
    time: race.schedule?.race?.time ?? race.time ?? null,
    circuit: circuit?.circuitName ?? "Circuit inconnu",
    location,
  };
}

function mapQualifyingResults(results: ApiQualyResult[]): QualifyingResult[] {
  const bestQ1 = fastestLapTimeMs(results.map((r) => r.q1));
  const bestQ2 = fastestLapTimeMs(results.map((r) => r.q2));
  const bestQ3 = fastestLapTimeMs(results.map((r) => r.q3));

  return results.map((q) => ({
    // Sur l'endpoint qualy, `gridPosition` est le classement de la séance
    // (`classificationId` n'est qu'un identifiant d'enregistrement).
    position: q.gridPosition?.toString() ?? q.position?.toString() ?? "-",
    driver: `${q.driver?.name ?? ""} ${q.driver?.surname ?? ""}`.trim(),
    driverNationality: q.driver?.nationality,
    constructor: q.team?.teamName ?? "N/A",
    grid: "-", // pas nécessaire en qualif
    q1: q.q1 ?? undefined,
    q2: q.q2 ?? undefined,
    q3: q.q3 ?? undefined,
    points: "0",
    isFastestQ1: isFastestTime(q.q1, bestQ1),
    isFastestQ2: isFastestTime(q.q2, bestQ2),
    isFastestQ3: isFastestTime(q.q3, bestQ3),
  }));
}

function mapFreePracticeResults(
  results: ApiFreePracticeResult[],
): FreePracticeResult[] {
  return results.map((fp, index) => ({
    position: fp.position?.toString() ?? (index + 1).toString(),
    driver: `${fp.driver?.name ?? ""} ${fp.driver?.surname ?? ""}`.trim(),
    driverNationality: fp.driver?.nationality,
    constructor: fp.team?.teamName ?? "N/A",
    time: fp.time ?? "N/A",
  }));
}

function normalizeScheduleEntry(session: ApiScheduleEntry | undefined): {
  date: string | null;
  time: string | null;
} {
  return {
    date: session?.date ?? null,
    time: session?.time ?? null,
  };
}

export async function fetchRaces(season: string): Promise<Race[]> {
  const json = await fetchApi<ApiSeasonResponse>(`${API_BASE_URL}/${season}`, {
    season,
  });
  const rawRaces = json.races ?? [];
  return rawRaces.map(mapRace);
}

/**
 * `null` quand la manche n'existe pas : c'est le test d'existence utilisé par
 * la page résultats pour rendre un vrai 404.
 */
export async function fetchRaceResults(
  season: string,
  round: string,
): Promise<null | {
  raceName: string;
  location: string;
  date: string;
  time: string;
  circuit: {
    name: string;
    locality: string;
    country: string;
    url: string;
  };
  results: RaceResult[];
}> {
  const json = await fetchApiOrNull<ApiRaceResponse>(
    `${API_BASE_URL}/${season}/${round}/race`,
    { season },
  );
  if (json === null) return null;

  const race = json?.races;
  // f1api.dev returns `circuit` as a single-element array when queried by an
  // explicit round number, but as a plain object for "last" or the season
  // list endpoint. Normalize so both shapes work.
  const circuit = Array.isArray(race?.circuit)
    ? race.circuit[0]
    : race?.circuit;
  const results = race?.results ?? [];
  const bestFastestLap = fastestLapTimeMs(results.map((r) => r.fastLap));

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location: circuit ? `${circuit.city}, ${circuit.country}` : "Lieu inconnu",
    date: race?.date ?? "",
    time: race?.time ?? "",
    circuit: {
      // Le typage a montré que ces quatre champs pouvaient être `undefined`
      // alors que le modèle les annonce en `string` : on les comble ici
      // plutôt que d'afficher « undefined ».
      name: circuit?.circuitName ?? "Circuit inconnu",
      locality: circuit?.city ?? "",
      country: circuit?.country ?? "",
      url: circuit?.url ?? "",
    },
    results: results.map(
      (r): RaceResult => ({
        position: r.position?.toString() ?? "-",
        driver: `${r.driver?.name ?? ""} ${r.driver?.surname ?? ""}`.trim(),
        driverNationality: r.driver?.nationality,
        constructor: r.team?.teamName ?? "N/A",
        time: r.time ?? r.retired ?? "N/A",
        points: r.points?.toString() ?? "0",
        fastestLap: r.fastLap
          ? {
              rank: isFastestTime(r.fastLap, bestFastestLap)
                ? "1"
                : (r.fastestLapRank?.toString() ?? "-"),
              lap: r.fastestLapLap?.toString() ?? "-",
              time: r.fastLap,
              averageSpeed: r.fastLapSpeed ?? "-",
            }
          : undefined,
        grid: r.grid?.toString() ?? "-",
      }),
    ),
  };
}

export async function fetchSprintResults(
  season: string,
  round: string,
): Promise<{ results: SprintResult[] }> {
  // Many seasons/rounds simply have no sprint (404). Next.js's fetch Data
  // Cache only caches 2xx responses, so a 404 would otherwise be re-fetched
  // (and pay the ~5s f1api.dev latency) on every single request. Cache the
  // resolved value ourselves instead, regardless of the underlying status.
  return unstable_cache(
    async () => {
      const json = await fetchApiOrNull<ApiRaceResponse>(
        `${API_BASE_URL}/${season}/${round}/sprint/race`,
        { season },
      );
      if (json === null) return { results: [] };

      const results = json?.races?.sprintRaceResults ?? [];

      return {
        results: results.map(
          (r): SprintResult => ({
            position: r.position?.toString() ?? "-",
            driver: `${r.driver?.name ?? ""} ${r.driver?.surname ?? ""}`.trim(),
            constructor: r.team?.teamName ?? "N/A",
            laps: "-", // non fourni par la nouvelle API sprint
            grid: r.gridPosition?.toString() ?? "-",
            time: r.time ?? r.retired ?? "N/A",
            points: r.points?.toString() ?? "0",
          }),
        ),
      };
    },
    ["fetchSprintResults", season, round],
    { revalidate: isLiveSeason(season) ? 60 : false },
  )();
}

export async function fetchFreePracticeResults(
  season: string,
  round: string,
  session: "fp1" | "fp2" | "fp3",
): Promise<{ results: FreePracticeResult[] }> {
  // Same reasoning as fetchSprintResults: old seasons 404 on FP endpoints,
  // and 404s never hit the fetch Data Cache, so cache the value ourselves.
  return unstable_cache(
    async () => {
      const json = await fetchApiOrNull<ApiRaceResponse>(
        `${API_BASE_URL}/${season}/${round}/${session}`,
        { season },
      );
      if (json === null) return { results: [] };

      // Le dernier repli était `json?.races`, c'est-à-dire l'objet manche —
      // pas un tableau. `mapFreePracticeResults` aurait appelé `.map()` dessus
      // et levé. Révélé par le typage ; on garde deux formes connues, et on
      // vérifie que c'en est bien une.
      const candidate =
        json?.races?.[`${session}Results` as const] ?? json?.races?.results;
      const results = Array.isArray(candidate) ? candidate : [];

      return { results: mapFreePracticeResults(results) };
    },
    ["fetchFreePracticeResults", season, round, session],
    { revalidate: isLiveSeason(season) ? 60 : false },
  )();
}

export async function fetchQualifyingResults(
  season: string,
  round: string,
): Promise<{
  results: QualifyingResult[];
}> {
  // Comme pour le sprint et les essais : une qualif non publiée renvoie 404,
  // ce qui n'est pas une raison de casser la page.
  const json = await fetchApiOrNull<ApiRaceResponse>(
    `${API_BASE_URL}/${season}/${round}/qualy`,
    { season },
  );
  const results = json?.races?.qualyResults ?? [];

  return {
    results: mapQualifyingResults(results),
  };
}

export async function fetchRaceSchedule(
  season: string,
  round: string,
): Promise<{
  /**
   * Année réelle de la saison. L'alias "current" fonctionne sur /api/current
   * mais **pas** sur les sous-ressources (/api/current/13/qualy renvoie 404) :
   * les appelants ont besoin de l'année pour aller chercher les résultats.
   */
  season: number | null;
  schedule: RaceSchedule;
  circuitDetails?: RaceCircuitDetails;
} | null> {
  try {
    const baseUrl =
      season === "current"
        ? `${API_BASE_URL}/current`
        : `${API_BASE_URL}/${season}`;
    const json = await fetchApi<ApiSeasonResponse>(baseUrl, { season });
    const races = json?.races ?? [];

    const byRound =
      round === "last"
        ? races
            .slice()
            .sort(
              (a: ApiRace, b: ApiRace) =>
                Number(b.round ?? 0) - Number(a.round ?? 0),
            )[0]
        : races.find((r: ApiRace) => String(r.round) === String(round));

    const race = byRound ?? null;
    const schedule = race?.schedule;
    if (!schedule) return null;

    // Même normalisation que dans `mapRace` : ce site-ci lisait `circuit`
    // directement et cassait sur la forme tableau.
    const circuitDetails = normalizeCircuit(race?.circuit);

    const resolvedSeason = Number(json?.season);

    return {
      season: Number.isFinite(resolvedSeason) ? resolvedSeason : null,
      schedule: {
        fp1: normalizeScheduleEntry(schedule.fp1),
        fp2: normalizeScheduleEntry(schedule.fp2),
        fp3: normalizeScheduleEntry(schedule.fp3),
        qualy: normalizeScheduleEntry(schedule.qualy),
        sprintQualy: normalizeScheduleEntry(schedule.sprintQualy),
        sprintRace: normalizeScheduleEntry(schedule.sprintRace),
        race: normalizeScheduleEntry(schedule.race ?? race),
      },
      circuitDetails: circuitDetails
        ? {
            name: circuitDetails.circuitName,
            country: circuitDetails.country,
            city: circuitDetails.city,
            circuitLength: circuitDetails.circuitLength,
            lapRecord: circuitDetails.lapRecord,
            firstParticipationYear: circuitDetails.firstParticipationYear,
            corners: circuitDetails.corners,
            fastestLapDriverId: circuitDetails.fastestLapDriverId,
            fastestLapTeamId: circuitDetails.fastestLapTeamId,
            fastestLapYear: circuitDetails.fastestLapYear,
            url: circuitDetails.url,
          }
        : undefined,
    };
  } catch (error) {
    console.error("[fetchRaceSchedule] Failed to fetch data", error);
    return null;
  }
}
