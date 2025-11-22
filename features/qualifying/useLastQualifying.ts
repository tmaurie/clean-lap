import { useQuery } from "@tanstack/react-query";
import { fetchLastQualifying } from "@/lib/api/race";

export function useLastQualifying() {
  return useQuery({
    queryKey: ["lastQualifying"],
    queryFn: fetchLastQualifying,
    staleTime: 1000 * 60 * 15, // 15 min
  });
}
