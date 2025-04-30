import { fetchRacesWithWinner, fetchSeasonDetails } from "@/lib/api/results";
import { fetchRaceResults } from "@/lib/api/race";

export function useSeasonWithRaceCount() {
  return fetchSeasonDetails();
}

export async function useRacesWithWinner(season: string) {
  return await fetchRacesWithWinner(season);
}

export async function getRaceResults(season: string, round: string) {
  return fetchRaceResults(season, round);
}
