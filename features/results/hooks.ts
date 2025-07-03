import {
  fetchRacesWithWinner,
  fetchSeasonDetailsPage,
} from "@/lib/api/results";
import { fetchRaceResults } from "@/lib/api/race";

export async function useSeasonWithRaceCount(page: number | undefined) {
  return fetchSeasonDetailsPage(page);
}

export async function useRacesWithWinner(season: string) {
  return await fetchRacesWithWinner(season);
}

export async function getRaceResults(season: string, round: string) {
  return fetchRaceResults(season, round);
}
