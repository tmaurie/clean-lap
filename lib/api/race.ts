import { Race, RaceResult } from "@/entities/race/model";
import { API_ROUTES } from "@/lib/config/api";

export async function fetchNextRace(): Promise<Race | null> {
  const res = await fetch(API_ROUTES.nextRace);
  const json = await res.json();

  try {
    const raceData = json.MRData.RaceTable.Races[0];
    return {
      name: raceData.raceName,
      circuit: raceData.Circuit.circuitName,
      date: raceData.date,
      time: raceData.time,
      location: `${raceData.Circuit.Location.locality}, ${raceData.Circuit.Location.country}`,
    };
  } catch (err) {
    console.error("[fetchNextRace] Failed to parse race data", err);
    return null;
  }
}

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const res = await fetch(
    API_ROUTES.races(new Date().getFullYear().toString()),
  );
  const json = await res.json();

  const races = json.MRData.RaceTable.Races as any[];

  const now = new Date();

  return races
    .map(
      (race): Race => ({
        name: race.raceName,
        date: race.date,
        time: race.time,
        circuit: race.Circuit.circuitName,
        location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
      }),
    )
    .filter((race) => new Date(`${race.date}T${race.time}`) > now);
}

export async function fetchRaces(season: string): Promise<Race[]> {
  const res = await fetch(API_ROUTES.races(season));
  const json = await res.json();
  const rawRaces = json.MRData.RaceTable.Races;

  return rawRaces.map((r: any) => ({
    name: r.raceName,
    date: r.date,
    time: r.time,
    circuit: r.Circuit.circuitName,
    location: `${r.Circuit.Location.locality}, ${r.Circuit.Location.country}`,
  }));
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
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`,
  );
  const json = await res.json();

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
    results: results.map(
      (r: any): RaceResult => ({
        position: r.position,
        driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
        constructor: r.Constructor.name,
        time: r.Time?.time ?? "+ " + r.status,
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
    ),
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
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/sprint.json`,
  );
  const json = await res.json();
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
  const res = await fetch(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/qualifying.json`,
  );
  const json = await res.json();
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
