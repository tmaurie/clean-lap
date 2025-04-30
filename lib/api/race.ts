import { Race, RaceResult } from "@/entities/race/model";
import { API_ROUTES } from "@/lib/config/api";

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  return await res.json();
}

function mapRace(race: any): Race {
  return {
    name: race.raceName,
    date: race.date,
    time: race.time,
    circuit: race.Circuit.circuitName,
    location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
  };
}

function mapRaceResults(results: any[]): RaceResult[] {
  return results.map(
    (r: any): RaceResult => ({
      position: r.position,
      driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
      driverNationality: r.Driver.nationality,
      constructor: r.Constructor.name,
      time: r.Time?.time ?? r.status,
      points: r.points,
      fastestLap: {
        rank: r.FastestLap?.rank,
        lap: r.FastestLap?.lap,
        time: r.FastestLap?.Time?.time,
        averageSpeed: r.FastestLap?.AverageSpeed?.speed,
      },
      grid: r.grid,
      laps: r.laps,
    }),
  );
}

export async function fetchNextRace(): Promise<Race | null> {
  try {
    const json = await fetchJSON(API_ROUTES.nextRace);
    const raceData = json.MRData.RaceTable.Races[0];
    return mapRace(raceData);
  } catch (err) {
    console.error("[fetchNextRace] Failed to parse race data", err);
    return null;
  }
}

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const json = await fetchJSON(
    API_ROUTES.races(new Date().getFullYear().toString()),
  );
  const races = json.MRData.RaceTable.Races as any[];
  const now = new Date();

  return races
    .map(mapRace)
    .filter((race) => new Date(`${race.date}T${race.time}`) > now);
}

export async function fetchRaces(season: string): Promise<Race[]> {
  const json = await fetchJSON(API_ROUTES.races(season));
  const rawRaces = json.MRData.RaceTable.Races;
  return rawRaces.map(mapRace);
}

export async function fetchRaceResults(
  season: string,
  round: string,
): Promise<{
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
  const json = await fetchJSON(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`,
  );
  const race = json.MRData.RaceTable.Races[0];
  const results = race?.Results ?? [];

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location: `${race?.Circuit?.Location?.locality}, ${race?.Circuit?.Location?.country}`,
    date: race?.date,
    time: race?.time,
    circuit: {
      name: race?.Circuit?.circuitName,
      locality: race?.Circuit?.Location?.locality,
      country: race?.Circuit?.Location?.country,
      url: race?.Circuit?.url,
    },
    results: mapRaceResults(results),
  };
}

export async function fetchSprintResults(
  season: string,
  round: string,
): Promise<{
  results: {
    position: string;
    driver: string;
    constructor: string;
    laps: string;
    grid: string;
    time: string;
    points: string;
  }[];
}> {
  const json = await fetchJSON(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/sprint.json`,
  );
  const race = json?.MRData?.RaceTable?.Races?.[0];
  const results = race?.SprintResults ?? [];

  return {
    results: results.map((r: any) => ({
      position: r.position,
      driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
      constructor: r.Constructor.name,
      laps: r.laps,
      grid: r.grid,
      time: r.Time?.time ?? "+ " + r.status,
      points: r.points,
    })),
  };
}

export async function fetchQualifyingResults(
  season: string,
  round: string,
): Promise<{
  results: {
    position: string;
    driver: string;
    constructor: string;
    grid: string;
    time: string;
    points: string;
  }[];
}> {
  const json = await fetchJSON(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/qualifying.json`,
  );
  const race = json?.MRData?.RaceTable?.Races?.[0];
  const results = race?.QualifyingResults ?? [];

  return {
    results: results.map((q: any) => ({
      position: q.position,
      driver: `${q.Driver.givenName} ${q.Driver.familyName}`,
      constructor: q.Constructor.name,
      grid: "-", // pas nécessaire en qualif
      q1: q.Q1,
      q2: q.Q2,
      q3: q.Q3,
      points: 0,
    })),
  };
}
