import { useQuery } from "@tanstack/react-query";
import { fetchRaces } from "@/lib/api/race";
import { isPastRace } from "@/lib/utils/date";

export function useSeasonProgress() {
  return useQuery({
    queryKey: ["seasonProgress"],
    queryFn: async () => {
      const races = await fetchRaces("current");
      const completed = races.filter((race) => isPastRace(race.date)).length;
      const total = races.length;
      return {
        year: new Date().getFullYear(),
        round: Math.min(completed + 1, total || 1),
        total,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
