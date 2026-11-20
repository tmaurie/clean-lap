import type { Season } from "@/entities/season/model";
import { archivedSeasons } from "./reference";
import {
  jolpicaCalendar,
  jolpicaCalendarWithWinners,
  jolpicaConstructorStandings,
  jolpicaDriverStandings,
} from "./jolpica";
import { EARLIEST_SEASON, SEASONS_PAGE_SIZE } from "./seasonsPage";

async function fetchSeasonSnapshot(season: string): Promise<Season> {
  const [races, drivers, constructors] = await Promise.all([
    jolpicaCalendar(season),
    jolpicaDriverStandings(season),
    jolpicaConstructorStandings(season),
  ]);
  const driver = drivers[0]?.driver;
  return {
    season,
    raceCount: races.length,
    driverChampion:
      driver?.name && driver.surname && driver.nationality
        ? {
            name: `${driver.name} ${driver.surname}`,
            nationality: driver.nationality,
          }
        : undefined,
    constructorChampion: constructors[0]?.team?.teamName,
  };
}

export async function fetchSeasonDetailsPage(
  page = 1,
  pageSize = SEASONS_PAGE_SIZE,
  signal?: AbortSignal,
): Promise<Season[]> {
  signal?.throwIfAborted();
  const currentYear = new Date().getFullYear();
  const first = currentYear - (page - 1) * pageSize;
  const last = Math.max(EARLIEST_SEASON, first - pageSize + 1);
  const seasons = [];

  for (let year = first; year >= last; year--) {
    const season = String(year);
    seasons.push(
      (year < currentYear && archivedSeasons[season]) ||
        fetchSeasonSnapshot(season),
    );
  }

  const result = await Promise.all(seasons);
  signal?.throwIfAborted();
  return result;
}

export async function fetchRacesWithWinner(season: string) {
  const races = await jolpicaCalendarWithWinners(season);
  return races.map((race) => {
    const winner = race.winner
      ? `${race.winner.name ?? ""} ${race.winner.surname ?? ""}`.trim()
      : "";
    const circuit = race.circuit;
    const location = [circuit?.city, circuit?.country]
      .filter(Boolean)
      .join(", ");

    return {
      round: race.round?.toString() ?? "-",
      name: race.raceName ?? "Grand Prix",
      date: race.date ?? "",
      time: race.time ?? undefined,
      circuit: circuit?.circuitName,
      circuitId: circuit?.circuitId,
      location: location || "Lieu inconnu",
      winner: winner || undefined,
      winnerTeam: race.teamWinner?.teamName,
    };
  });
}
