import { useQuery } from "@tanstack/react-query";
import { fetchDriverSeason } from "@/lib/api/drivers";

export function useDriverSeason(driverId: string, season: string) {
  return useQuery({
    queryKey: ["driverSeason", driverId, season],
    queryFn: () => fetchDriverSeason(driverId, season),
    enabled: Boolean(driverId) && Boolean(season),
  });
}
