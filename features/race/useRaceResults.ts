import { useQuery } from "@tanstack/react-query";
import { fetchRaceResults } from "@/lib/api/race";

export function useRaceResults(round: number | "last") {
  return useQuery({
    queryKey: ["raceResults", round],
    queryFn: () => fetchRaceResults(round),
    enabled: !!round,
  });
}
