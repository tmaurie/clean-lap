import { useQuery } from "@tanstack/react-query";
import { fetchUpcomingRaces } from "@/lib/api/race";

export function useUpcomingRaces() {
  return useQuery({
    queryKey: ["upcomingRaces"],
    queryFn: fetchUpcomingRaces,
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
