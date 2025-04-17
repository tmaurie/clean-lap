import { Race } from "@/entities/race/model";
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
