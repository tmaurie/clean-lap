import { useQuery } from "@tanstack/react-query";
import {
  fetchDriverStandings,
  fetchConstructorStandings,
} from "@/lib/api/standings";

export function useDriverStandings(season: string) {
  return useQuery({
    queryKey: ["driverStandings", season],
    queryFn: () => fetchDriverStandings(season),
    enabled: !!season,
    staleTime: 1000 * 60 * 30,
  });
}

export function useConstructorStandings(season: string) {
  return useQuery({
    queryKey: ["constructorStandings"],
    queryFn: () => fetchConstructorStandings(season),
    enabled: !!season,
    staleTime: 1000 * 60 * 30,
  });
}
