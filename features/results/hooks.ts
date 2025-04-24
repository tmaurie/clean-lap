import { fetchRacesWithWinner, fetchSeasonsDetails } from "@/lib/api/results";
import { fetchRaceResults } from "@/lib/api/race";
import { useQuery } from "@tanstack/react-query";

export function useSeasonWithRaceCount() {
  return fetchSeasonsDetails();
}

export function useRacesWithWinner(season: string) {
  return fetchRacesWithWinner(season);
}

export async function getRaceResults(season: string, round: string) {
  return fetchRaceResults(season, round);
}

export function useRaceResults(season: string, round: string) {
  return useQuery({
    queryKey: ["raceResults", season, round],
    queryFn: () => fetchRaceResults(season, round),
    enabled: !!season && !!round,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
