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
  round: number | "last",
): Promise<{ raceName: string; results: RaceResult[] }> {
  const res = await fetch(API_ROUTES.results(season, round));
  const json = await res.json();

  const race = json.MRData.RaceTable.Races[0];
  const results = race?.Results ?? [];

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    results: results.map(
      (r: any): RaceResult => ({
        position: r.position,
        driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
        constructor: r.Constructor.name,
        time: r.Time?.time ?? "+ " + r.status,
        points: r.points,
      }),
    ),
  };
}
