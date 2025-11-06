import {
  fetchRacesWithWinner,
  fetchSeasonDetailsPage,
} from "@/lib/api/results";
import { fetchRaceResults } from "@/lib/api/race";

export async function getSeasonsWithRaceCount(
  page: number | undefined,
  pageSize?: number,
  signal?: AbortSignal,
) {
  return fetchSeasonDetailsPage(page, pageSize, signal);
}

export async function getRacesWithWinner(season: string) {
  return await fetchRacesWithWinner(season);
}

export async function getRaceResults(season: string, round: string) {
  return fetchRaceResults(season, round);
}
