import { useQuery } from "@tanstack/react-query";
import { fetchRaces } from "@/lib/api/race";
import { isPastRace, toRaceDate } from "@/lib/utils/date";

export function useSeasonProgress() {
  return useQuery({
    queryKey: ["seasonProgress"],
    queryFn: async () => {
      const races = await fetchRaces("current");
      const calendar = [...races].sort(
        (a, b) =>
          (toRaceDate(a.date, a.time)?.getTime() ?? 0) -
          (toRaceDate(b.date, b.time)?.getTime() ?? 0),
      );
      const total = calendar.length;
      // Même correction que sur la home : la manche en cours est la première
      // qui n'est pas terminée (heure de départ comprise), et son numéro vient
      // de l'API, pas de l'index du tableau.
      const nextIndex = calendar.findIndex(
        (race) => !isPastRace(race.date, race.time),
      );

      return {
        year: new Date().getFullYear(),
        round:
          nextIndex === -1
            ? total || 1
            : (calendar[nextIndex].round ?? nextIndex + 1),
        total,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
