import { useQuery } from "@tanstack/react-query";
import { fetchRaceResults } from "@/lib/api/race";

export function useRaceResults(season: string, round: string | "last") {
  return useQuery({
    queryKey: ["raceResults", round],
    queryFn: () => fetchRaceResults(season, round),
    enabled: !!round,
  });
}
