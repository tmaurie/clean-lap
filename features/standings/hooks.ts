import { useQuery } from "@tanstack/react-query";
import {
  fetchDriverStandings,
  fetchConstructorStandings,
} from "@/lib/api/standings";

export function useDriverStandings() {
  return useQuery({
    queryKey: ["driverStandings"],
    queryFn: fetchDriverStandings,
    staleTime: 1000 * 60 * 30,
  });
}

export function useConstructorStandings() {
  return useQuery({
    queryKey: ["constructorStandings"],
    queryFn: fetchConstructorStandings,
    staleTime: 1000 * 60 * 30,
  });
}
