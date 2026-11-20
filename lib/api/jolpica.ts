import { requestData } from "./client";
import {
  cleanLapCircuitId,
  cleanLapDriverId,
  jolpicaCircuitId,
  jolpicaDriverId,
} from "./ids";
import { circuitReference, raceReference, teamReference } from "./reference";
import type {
  ApiCircuit,
  ApiDriver,
  ApiDriverSeasonResponse,
  ApiRace,
  ApiRaceResult,
  ApiTeam,
  ApiTeamDriversResponse,
} from "./types";

type Driver = {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth?: string;
  permanentNumber?: string;
  code?: string;
  nationality?: string;
  url?: string;
};

type Constructor = {
  constructorId: string;
  name: string;
  nationality?: string;
  url?: string;
};

type Circuit = {
  circuitId: string;
  circuitName: string;
  url?: string;
  Location: { locality: string; country: string };
};

type ScheduleEntry = { date: string; time?: string };
type Result = {
  position?: string;
  positionText?: string;
  points?: string;
  grid?: string;
  laps?: string;
  status?: string;
  Driver: Driver;
  Constructor?: Constructor;
  Time?: { time?: string };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: { time?: string };
    AverageSpeed?: { speed?: string };
  };
};

type Race = ScheduleEntry & {
  season: string;
  round: string;
  raceName: string;
  url?: string;
  Circuit: Circuit;
  FirstPractice?: ScheduleEntry;
  SecondPractice?: ScheduleEntry;
  ThirdPractice?: ScheduleEntry;
  Qualifying?: ScheduleEntry;
  SprintQualifying?: ScheduleEntry;
  SprintShootout?: ScheduleEntry;
  Sprint?: ScheduleEntry;
  Results?: Result[];
  SprintResults?: Result[];
  QualifyingResults?: (Result & { Q1?: string; Q2?: string; Q3?: string })[];
};

type Standing = { position: string; points: string; wins: string };
type DriverStanding = Standing & {
  Driver: Driver;
  Constructors: Constructor[];
};
type ConstructorStanding = Standing & { Constructor: Constructor };

type Envelope = {
  MRData: {
    limit: string;
    offset: string;
    total: string;
    RaceTable?: { Races: Race[] };
    DriverTable?: { Drivers: Driver[] };
    ConstructorTable?: { Constructors: Constructor[] };
    CircuitTable?: { Circuits: Circuit[] };
    StandingsTable?: {
      StandingsLists: {
        DriverStandings?: DriverStanding[];
        ConstructorStandings?: ConstructorStanding[];
      }[];
    };
  };
};

const pageSize = 100;

async function list<T>(
  path: string,
  season: string | undefined,
  rows: (data: Envelope["MRData"]) => T[] | undefined,
): Promise<T[]> {
  const items: T[] = [];
  let offset = 0;
  do {
    const response = await requestData<Envelope>(
      "jolpica",
      `${path}/?limit=${pageSize}&offset=${offset}`,
      season,
    );
    if (!response) {
      if (offset === 0) return [];
      throw new Error(`jolpica: missing page at offset ${offset} for ${path}`);
    }

    const data = response.MRData;
    const page = rows(data);
    const total = Number(data.total);
    const next = Number(data.offset) + Number(data.limit);
    if (
      !Array.isArray(page) ||
      !Number.isInteger(total) ||
      next <= offset ||
      !Number.isFinite(next)
    ) {
      throw new Error(`jolpica: invalid pagination for ${path}`);
    }
    items.push(...page);
    if (next >= total) break;
    offset = next;
  } while (true);
  return items;
}

export function seasonYear(season: string): string {
  return season === "current" ? String(new Date().getFullYear()) : season;
}

export function validSeason(season: string): boolean {
  return (
    /^\d{4}$/.test(seasonYear(season)) && Number(seasonYear(season)) >= 1950
  );
}

function validId(id: string): boolean {
  return /^[a-z0-9_-]+$/i.test(id);
}

function mapDriver(driver: Driver): ApiDriver {
  const number = Number(driver.permanentNumber);
  return {
    driverId: cleanLapDriverId(driver.driverId),
    name: driver.givenName,
    surname: driver.familyName,
    birthday: driver.dateOfBirth,
    number: Number.isFinite(number) ? number : null,
    shortName: driver.code,
    nationality: driver.nationality,
    url: driver.url,
  };
}

function mapTeam(team?: Constructor): ApiTeam | undefined {
  if (!team) return undefined;
  return {
    teamId: team.constructorId,
    teamName: team.name,
    nationality: team.nationality,
    url: team.url,
  };
}

function mapCircuit(circuit: Circuit): ApiCircuit {
  return {
    ...circuitReference(circuit.circuitId),
    circuitId: cleanLapCircuitId(circuit.circuitId),
    circuitName: circuit.circuitName,
    city: circuit.Location.locality,
    country: circuit.Location.country,
    url: circuit.url,
  };
}

function mapRaceResult(result: Result): ApiRaceResult {
  return {
    position: result.positionText ?? result.position,
    grid: result.grid,
    points: result.points,
    time: result.Time?.time,
    fastLap: result.FastestLap?.Time?.time,
    fastLapSpeed: result.FastestLap?.AverageSpeed?.speed,
    fastestLapRank: result.FastestLap?.rank,
    fastestLapLap: result.FastestLap?.lap,
    retired: result.status,
    driver: mapDriver(result.Driver),
    team: mapTeam(result.Constructor),
  };
}

function mapRace(race: Race): ApiRace {
  const reference = raceReference(race.date, race.Circuit.circuitId);
  const winner = reference?.winner;
  const circuit = mapCircuit(race.Circuit);
  const circuitLength = reference?.circuitLength ?? circuit.circuitLength;
  const corners = reference?.corners ?? circuit.corners;
  // A circuit record is tied to its layout. The historic layout can differ.
  const sameLayout =
    circuitLength === circuit.circuitLength && corners === circuit.corners;
  return {
    raceName: race.raceName,
    round: race.round,
    date: race.date,
    time: race.time,
    url: race.url,
    circuit: {
      ...circuit,
      circuitLength,
      corners,
      lapRecord: sameLayout ? circuit.lapRecord : null,
      fastestLapDriverId: sameLayout ? circuit.fastestLapDriverId : null,
      fastestLapTeamId: sameLayout ? circuit.fastestLapTeamId : null,
      fastestLapYear: sameLayout ? circuit.fastestLapYear : null,
    },
    winner: winner ? { name: winner.name, surname: winner.surname } : null,
    teamWinner: winner
      ? { teamName: winner.teamName, teamId: winner.teamId ?? undefined }
      : null,
    schedule: {
      race: { date: race.date, time: race.time },
      fp1: race.FirstPractice,
      fp2: race.SecondPractice,
      fp3: race.ThirdPractice,
      qualy: race.Qualifying,
      sprintQualy: race.SprintQualifying ?? race.SprintShootout,
      sprintRace: race.Sprint,
    },
    results: race.Results?.map(mapRaceResult),
    sprintRaceResults: race.SprintResults?.map((entry) => ({
      ...mapRaceResult(entry),
      gridPosition: entry.grid,
      laps: entry.laps,
    })),
    qualyResults: race.QualifyingResults?.map((entry) => ({
      position: entry.position,
      q1: entry.Q1 || null,
      q2: entry.Q2 || null,
      q3: entry.Q3 || null,
      driver: mapDriver(entry.Driver),
      team: mapTeam(entry.Constructor),
    })),
  };
}

function raceRows(path: string, season: string) {
  return list(path, season, (data) => data.RaceTable?.Races);
}

export async function jolpicaCalendar(season: string) {
  if (!validSeason(season)) return [];
  const year = seasonYear(season);
  return (await raceRows(year, year)).map(mapRace);
}

export async function jolpicaCalendarWithWinners(
  season: string,
): Promise<ApiRace[]> {
  const races = await jolpicaCalendar(season);
  if (
    !races.some(
      (race) =>
        !race.winner &&
        race.date &&
        race.date <= new Date().toISOString().slice(0, 10),
    )
  ) {
    return races;
  }
  const year = seasonYear(season);
  const classifications = await raceRows(`${year}/results/1`, year);
  const winners = new Map(
    classifications.map((race) => [race.round, race.Results?.[0]]),
  );
  return races.map((race) => {
    const winner = winners.get(String(race.round));
    return winner
      ? {
          ...race,
          winner: mapDriver(winner.Driver),
          teamWinner: mapTeam(winner.Constructor),
        }
      : race;
  });
}

export async function jolpicaSession(
  season: string,
  round: string,
  session: "results" | "qualifying" | "sprint",
): Promise<ApiRace | null> {
  if (!validSeason(season) || !/^(last|[1-9]\d*)$/.test(round)) return null;
  if (round === "last" && session !== "results") {
    const last = await jolpicaSession(season, round, "results");
    return last?.round == null
      ? null
      : jolpicaSession(season, String(last.round), session);
  }
  const year = seasonYear(season);
  const races = await raceRows(`${year}/${round}/${session}`, year);
  const race = races[0];
  if (!race) return null;
  // Historic races can have more than 100 entries. Jolpica paginates individual
  // results and repeats the enclosing race when it spans a page.
  return mapRace({
    ...race,
    Results: races.flatMap((row) => row.Results ?? []),
    QualifyingResults: races.flatMap((row) => row.QualifyingResults ?? []),
    SprintResults: races.flatMap((row) => row.SprintResults ?? []),
  });
}

export async function jolpicaRace(
  season: string,
  round: string,
): Promise<ApiRace | null> {
  if (round === "last") return jolpicaSession(season, round, "results");
  if (!/^[1-9]\d*$/.test(round)) return null;
  return (
    (await jolpicaCalendar(season)).find((race) => race.round === round) ?? null
  );
}

export async function jolpicaDrivers(season?: string): Promise<ApiDriver[]> {
  if (season && !validSeason(season)) return [];
  const year = season ? seasonYear(season) : undefined;
  return (
    await list(
      year ? `${year}/drivers` : "drivers",
      year,
      (data) => data.DriverTable?.Drivers,
    )
  ).map(mapDriver);
}

export async function jolpicaDriverSeason(
  id: string,
  season: string,
): Promise<ApiDriverSeasonResponse | null> {
  if (!validId(id) || !validSeason(season)) return null;
  const year = seasonYear(season);
  const driverId = jolpicaDriverId(id);
  const base = `${year}/drivers/${driverId}`;
  const [races, sprints] = await Promise.all([
    raceRows(`${base}/results`, year),
    Number(year) >= 2021 ? raceRows(`${base}/sprint`, year) : [],
  ]);
  const raceEntries = new Map(races.map((race) => [race.round, race]));
  const sprintEntries = new Map(sprints.map((race) => [race.round, race]));
  const rounds = [
    ...new Set([...raceEntries.keys(), ...sprintEntries.keys()]),
  ].sort((a, b) => Number(a) - Number(b));
  const last = races.at(-1)?.Results?.[0] ?? sprints.at(-1)?.SprintResults?.[0];
  let driver = last?.Driver;
  if (!driver) {
    [driver] = await list(
      `drivers/${driverId}`,
      undefined,
      (data) => data.DriverTable?.Drivers,
    );
  }
  if (!driver) return null;

  return {
    driver: mapDriver(driver),
    team: mapTeam(last?.Constructor),
    results: rounds.flatMap((round) => {
      const raceEntry = raceEntries.get(round);
      const sprintEntry = sprintEntries.get(round);
      const data = raceEntry ?? sprintEntry;
      if (!data) return [];
      const race = mapRace(data);
      const result = raceEntry?.Results?.[0];
      const sprint = sprintEntry?.SprintResults?.[0];
      const circuit = mapCircuit(data.Circuit);
      return [
        {
          race: {
            name: race.raceName,
            round: Number(round),
            date: race.date,
            circuit: { city: circuit.city, country: circuit.country },
          },
          result: result
            ? {
                finishingPosition: /^\d+$/.test(result.positionText ?? "")
                  ? Number(result.positionText)
                  : (result.positionText ?? result.position),
                gridPosition:
                  Number(result.grid) > 0 ? Number(result.grid) : null,
                pointsObtained: result.points,
                retired: result.status,
              }
            : undefined,
          sprintResult: sprint
            ? {
                position: sprint.positionText ?? sprint.position,
                points: sprint.points,
              }
            : null,
        },
      ];
    }),
  };
}

async function driverStandings(season: string) {
  const year = seasonYear(season);
  if (!validSeason(year)) return [];
  return list(`${year}/driverstandings`, year, (data) =>
    data.StandingsTable?.StandingsLists.flatMap(
      (entry) => entry.DriverStandings ?? [],
    ),
  );
}

async function constructorStandings(season: string) {
  const year = seasonYear(season);
  if (!validSeason(year) || Number(year) < 1958) return [];
  return list(`${year}/constructorstandings`, year, (data) =>
    data.StandingsTable?.StandingsLists.flatMap(
      (entry) => entry.ConstructorStandings ?? [],
    ),
  );
}

export async function jolpicaDriverStandings(season: string) {
  return (await driverStandings(season)).map((entry) => ({
    position: entry.position,
    points: entry.points,
    wins: Number(entry.wins),
    driver: mapDriver(entry.Driver),
    team: mapTeam(entry.Constructors.at(-1)),
  }));
}

export async function jolpicaConstructorStandings(season: string) {
  return (await constructorStandings(season)).map((entry) => ({
    position: entry.position,
    points: entry.points,
    wins: Number(entry.wins),
    team: mapTeam(entry.Constructor),
  }));
}

export async function jolpicaTeam(id: string): Promise<ApiTeam | null> {
  if (!validId(id)) return null;
  const [team] = await list(
    `constructors/${id}`,
    undefined,
    (data) => data.ConstructorTable?.Constructors,
  );
  if (!team) return null;
  return { ...mapTeam(team), ...teamReference(team.constructorId) };
}

export async function jolpicaTeamSeason(
  id: string,
  season: string,
): Promise<ApiTeamDriversResponse | null> {
  if (!validId(id) || !validSeason(season)) return null;
  const year = seasonYear(season);
  const [driverRows, drivers, constructors] = await Promise.all([
    list(
      `${year}/constructors/${id}/drivers`,
      year,
      (data) => data.DriverTable?.Drivers,
    ),
    driverStandings(year),
    constructorStandings(year),
  ]);
  const standing = constructors.find(
    (row) => row.Constructor.constructorId === id,
  );
  const byId = new Map(drivers.map((row) => [row.Driver.driverId, row]));
  return {
    team: standing
      ? {
          ...mapTeam(standing.Constructor),
          position: standing.position,
          points: standing.points,
          wins: standing.wins,
        }
      : undefined,
    drivers: driverRows.map((row) => {
      const rank = byId.get(row.driverId);
      return {
        driver: {
          ...mapDriver(row),
          position: rank?.position,
          points: rank?.points,
          wins: rank?.wins,
        },
      };
    }),
  };
}

export async function jolpicaCircuit(id: string): Promise<ApiCircuit | null> {
  if (!validId(id)) return null;
  const [circuit] = await list(
    `circuits/${jolpicaCircuitId(id)}`,
    undefined,
    (data) => data.CircuitTable?.Circuits,
  );
  return circuit ? mapCircuit(circuit) : null;
}

export async function jolpicaCircuits(season: string): Promise<ApiCircuit[]> {
  if (!validSeason(season)) return [];
  const year = seasonYear(season);
  return (
    await list(`${year}/circuits`, year, (data) => data.CircuitTable?.Circuits)
  ).map(mapCircuit);
}
