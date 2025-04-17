import { useQuery } from "@tanstack/react-query";
import { fetchNextRace } from "@/lib/api/race";

export function useNextRace() {
  return useQuery({
    queryKey: ["nextRace"],
    queryFn: fetchNextRace,
    staleTime: 1000 * 60 * 60, // 1h
  });
}
