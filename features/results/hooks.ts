import {
  fetchRacesWithWinner,
  fetchSeasonsWithRaceCount,
} from "@/lib/api/results";

export function useSeasonWithRaceCount() {
  return fetchSeasonsWithRaceCount();
}

export function useRacesWithWinner(season: string) {
  return fetchRacesWithWinner(season);
}
