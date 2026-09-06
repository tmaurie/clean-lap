import { useQuery } from "@tanstack/react-query";
import { fetchRaces } from "@/lib/api/race";
import { resolveCurrentRace } from "@/features/season/currentRace";

export function useSeasonProgress() {
  return useQuery({
    queryKey: ["seasonProgress"],
    queryFn: async () => {
      const races = await fetchRaces("current");
      const { round, total } = resolveCurrentRace(races);

      return {
        year: new Date().getFullYear(),
        // Saison terminée : on affiche la dernière manche disputée.
        round: round ?? total ?? 1,
        total,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
