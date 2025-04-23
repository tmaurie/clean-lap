import { fetchRaces } from "@/lib/api/race";

export async function getCalendar(season: string) {
  return fetchRaces(season);
}
