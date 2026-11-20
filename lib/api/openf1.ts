import { countryCodeToDemonym, practiceReference } from "./reference";
import { requestData } from "./client";
import { jolpicaCircuitId } from "./ids";
import type { ApiRace } from "./types";
import type { FreePracticeResult } from "./race";
import { toRaceDate } from "@/lib/utils/date";
import { SESSION_DURATION_MINUTES } from "@/lib/utils/session";

export type PracticeKey = "fp1" | "fp2" | "fp3";
export type PracticeResults = {
  results: FreePracticeResult[];
  status:
    | "available"
    | "pending"
    | "scheduled"
    | "unavailable"
    | "notScheduled";
};

type Session = {
  session_key: number;
  meeting_key: number;
  session_name: string;
  circuit_short_name: string;
  location: string;
  date_start: string;
  date_end: string;
  is_cancelled?: boolean;
};

type Result = {
  position: number | null;
  driver_number: number;
  duration: number | null;
};
type Driver = {
  driver_number: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team_name?: string;
  country_code?: string;
};

const sessionNames: Record<PracticeKey, string> = {
  fp1: "Practice 1",
  fp2: "Practice 2",
  fp3: "Practice 3",
};

function normalize(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function sameCircuit(session: Session, names: string[]): boolean {
  const location = normalize(session.location);
  const shortName = normalize(session.circuit_short_name);
  return names.some(
    (name) =>
      name &&
      [location, shortName].some(
        (candidate) =>
          candidate === name ||
          (name.length >= 4 && candidate.startsWith(name)),
      ),
  );
}

function lapTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const millis = Math.round(seconds * 1000);
  const minutes = Math.floor(millis / 60_000);
  const remainder = String(millis % 60_000).padStart(5, "0");
  return `${minutes}:${remainder.slice(0, 2)}.${remainder.slice(2)}`;
}

const freeAccessDelay = 30 * 60_000;

export async function loadPractice(
  race: ApiRace,
  key: PracticeKey,
  now: Date,
): Promise<PracticeResults> {
  const circuit = race.circuit;
  if (!race.date || !circuit?.circuitId)
    return { results: [], status: "unavailable" };
  const date = race.date;
  const year = date.slice(0, 4);
  const circuitId = jolpicaCircuitId(circuit.circuitId);
  const start = toRaceDate(
    race.schedule?.[key]?.date,
    race.schedule?.[key]?.time,
  );
  const expectedEnd = start
    ? +start + SESSION_DURATION_MINUTES[key] * 60_000
    : null;
  const endedRecently =
    expectedEnd !== null && +now - expectedEnd < 24 * 60 * 60_000;

  if (expectedEnd !== null && +now < expectedEnd) {
    return { results: [], status: "scheduled" };
  }

  async function archive(): Promise<PracticeResults | null> {
    const rows = await practiceReference(date, circuitId, key);
    if (rows.length === 0) return null;
    return {
      status: "available",
      results: rows.map(
        ([position, driver, driverNationality, team, time]) => ({
          position: position ?? "—",
          driver,
          driverNationality,
          constructor: team ?? "—",
          time: time ?? "—",
        }),
      ),
    };
  }

  if (Number(year) < now.getFullYear()) {
    const historical = await archive();
    if (historical) return historical;
  }
  if (Number(year) < 2023) return { results: [], status: "unavailable" };

  if (
    !start &&
    (race.schedule?.sprintRace?.date || race.schedule?.sprintQualy?.date) &&
    key !== "fp1" &&
    Number(year) >= 2023
  ) {
    return { results: [], status: "notScheduled" };
  }

  try {
    const sessions = await requestData<Session[]>(
      "openf1",
      `sessions?year=${year}`,
      year,
    );
    const circuitNames = [circuit.city, circuit.circuitName, circuitId].map(
      normalize,
    );
    const meeting = sessions?.filter(
      (session) =>
        session.session_name === "Race" &&
        !session.is_cancelled &&
        session.date_start.slice(0, 10) === race.date &&
        sameCircuit(session, circuitNames),
    );
    const raceSession = meeting?.length === 1 ? meeting[0] : undefined;
    const practice =
      raceSession &&
      sessions?.find(
        (session) =>
          session.meeting_key === raceSession.meeting_key &&
          session.session_name === sessionNames[key] &&
          !session.is_cancelled,
      );

    if (practice) {
      const endsAt = Date.parse(practice.date_end);
      if (+now < endsAt + freeAccessDelay) {
        return (
          (await archive()) ?? {
            results: [],
            status: +now < endsAt ? "scheduled" : "pending",
          }
        );
      }

      const query = `session_key=${practice.session_key}`;
      const [results, drivers] = await Promise.all([
        requestData<Result[]>("openf1", `session_result?${query}`, year),
        requestData<Driver[]>("openf1", `drivers?${query}`, year),
      ]);
      if (results?.length && drivers?.length) {
        const driverByNumber = new Map(
          drivers.map((driver) => [driver.driver_number, driver]),
        );
        return {
          status: "available",
          results: [...results]
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity))
            .map((entry) => {
              const driver = driverByNumber.get(entry.driver_number);
              const name = [driver?.first_name, driver?.last_name]
                .filter(Boolean)
                .join(" ");
              return {
                position: entry.position?.toString() ?? "—",
                driver:
                  (name || driver?.full_name) ?? `#${entry.driver_number}`,
                driverNationality: countryCodeToDemonym(driver?.country_code),
                constructor: driver?.team_name ?? "—",
                time: lapTime(entry.duration),
              };
            }),
        };
      }
    }
  } catch (error) {
    console.warn("[OpenF1] essais libres momentanément indisponibles", error);
    return (await archive()) ?? { results: [], status: "unavailable" };
  }

  return (
    (await archive()) ?? {
      results: [],
      status: endedRecently ? "pending" : "unavailable",
    }
  );
}
