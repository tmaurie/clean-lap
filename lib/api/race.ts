import { Race, RaceResult } from "@/entities/race/model";

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url);
  console.log(`[fetchJSON] fetching URL: ${url}`, res);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function mapRace(race: any): Race {
  const location = [race.circuit?.city, race.circuit?.country]
    .filter(Boolean)
    .join(", ");

  return {
    name: race.raceName,
    date: race.schedule?.race?.date ?? race.date,
    time: race.schedule?.race?.time ?? race.time,
    circuit: race.circuit?.circuitName,
    location,
  };
}


export async function fetchNextRace(): Promise<Race | null> {
  try {
    const json = await fetchJSON("https://f1api.dev/api/current/next");
    console.log(json.race[0]);
    const raceData = json.race[0];
    return {
      name: raceData.raceName,
      date: raceData.schedule.race.date,
      time: raceData.schedule.race.time,
      circuit: raceData.circuit.circuitName,
      location: `${raceData.circuit.city}, ${raceData.circuit.country}`,
    };
  } catch (err) {
    console.error("[fetchNextRace] Failed to parse race data", err);
    return null;
  }
}

export async function fetchUpcomingRaces(): Promise<Race[]> {
  const json = await fetchJSON("https://f1api.dev/api/current");
  const races = json.races;
  const now = new Date();

  return races
    .map((raceData: any) => ({
      name: raceData.raceName,
      date: raceData.schedule.race.date,
      time: raceData.schedule.race.time,
      circuit: raceData.circuit.circuitName,
      location: `${raceData.circuit.city}, ${raceData.circuit.country}`,
    }))
    .filter((race: Race) => {
      const raceDateTime = new Date(`${race.date}T${race.time}`);
      return raceDateTime > now;
    });
}

export async function fetchRaces(season: string): Promise<Race[]> {
  const json = await fetchJSON(`https://f1api.dev/api/${season}`);
  const rawRaces = json.races ?? [];
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
  const json = await fetchJSON(`https://f1api.dev/api/${season}/${round}/race`);
  const race = json?.races;
  const results = race?.results ?? [];
  const fastestLapValue = (time: string | null | undefined) => {
    if (!time) return null;
    const numeric = Number(time.replace(/[:.]/g, ""));
    return Number.isNaN(numeric) ? null : numeric;
  };
  const bestFastestLap = results.reduce((best: number | null, r: any) => {
    const lapTime = fastestLapValue(r.fastLap);
    if (lapTime === null) return best;
    if (best === null || lapTime < best) return lapTime;
    return best;
  }, null);

  return {
    raceName: race?.raceName ?? "Grand Prix inconnu",
    location: race?.circuit
      ? `${race.circuit.city}, ${race.circuit.country}`
      : "Lieu inconnu",
    date: race?.date,
    time: race?.time,
    circuit: {
      name: race?.circuit?.circuitName,
      locality: race?.circuit?.city,
      country: race?.circuit?.country,
      url: race?.circuit?.url,
    },
    results: results.map(
      (r: any): RaceResult => ({
        position: r.position?.toString(),
        driver: `${r.driver?.name ?? ""} ${r.driver?.surname ?? ""}`.trim(),
        driverNationality: r.driver?.nationality,
        constructor: r.team?.teamName,
        time: r.time ?? r.retired ?? "N/A",
        points: r.points?.toString() ?? "0",
        fastestLap: r.fastLap
          ? {
              rank:
                bestFastestLap !== null &&
                fastestLapValue(r.fastLap) === bestFastestLap
                  ? "1"
                  : (r.fastestLapRank?.toString() ?? "-"),
              lap: r.fastestLapLap?.toString() ?? "-",
              time: r.fastLap,
              averageSpeed: r.fastLapSpeed,
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
