import { useQuery } from "@tanstack/react-query";
import { fetchDrivers } from "@/lib/api/drivers";

export function useDrivers(search: string, season: string = "current") {
  return useQuery({
    queryKey: ["drivers", search, season],
    queryFn: () => fetchDrivers({ search, season }),
  });
}
