import { Team, TeamLineupDriver, TeamSeason } from "@/entities/team/model";
import { jolpicaTeam, jolpicaTeamSeason } from "./jolpica";
import type {
  ApiTeam,
  ApiTeamDriversResponse,
  ApiTeamWithStanding,
} from "./types";

/** `Number()` tolérant : l'API mélange nombres, chaînes et valeurs textuelles. */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapTeam(team: ApiTeam, fallbackId: string): Team {
  return {
    id: team.teamId ?? fallbackId,
    name: team.teamName ?? fallbackId,
    nationality: team.nationality ?? null,
    firstSeason: team.firstAppearance ?? null,
    constructorsTitles: toNumber(team.constructorsChampionships),
    driversTitles: toNumber(team.driversChampionships),
    url: team.url ?? null,
  };
}

/** Fiche d'écurie hors saison. `null` si l'écurie n'existe pas. */
export async function fetchTeam(teamId: string): Promise<Team | null> {
  const team = await jolpicaTeam(teamId);
  return team ? mapTeam(team, teamId) : null;
}

/**
 * L'API renvoie l'effectif dans un ordre arbitraire (chez Ferrari 2024 :
 * le remplaçant d'abord). On trie par classement au championnat, les pilotes
 * sans position — donc sans course — en dernier.
 */
function sortByChampionship(drivers: TeamLineupDriver[]): TeamLineupDriver[] {
  return [...drivers].sort((a, b) => {
    if (a.position === null) return b.position === null ? 0 : 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });
}

function mapLineup(json: ApiTeamDriversResponse): TeamLineupDriver[] {
  const drivers = (json.drivers ?? []).flatMap((entry) => {
    const driver = entry.driver;
    if (!driver) return [];

    return [
      {
        id: driver.driverId ?? "",
        name: driver.name ?? "",
        surname: driver.surname ?? "",
        nationality: driver.nationality ?? null,
        number: toNumber(driver.number),
        shortName: driver.shortName ?? null,
        points: toNumber(driver.points),
        position: toNumber(driver.position),
        wins: toNumber(driver.wins),
      },
    ];
  });

  return sortByChampionship(drivers);
}

function mapStanding(team: ApiTeamWithStanding | undefined) {
  if (!team) return null;

  const position = toNumber(team.position);
  const points = toNumber(team.points);
  const wins = toNumber(team.wins);

  // Hors saison courue, l'API renvoie l'écurie sans aucun chiffre : on ne
  // fabrique pas un classement vide, on dit qu'il n'y en a pas.
  if (position === null && points === null && wins === null) return null;

  return { position, points, wins };
}

export async function fetchTeamSeason(
  teamId: string,
  season: string,
): Promise<TeamSeason | null> {
  const team = await fetchTeam(teamId);
  if (!team) return null;

  const seasonData = await jolpicaTeamSeason(team.id, season);
  return {
    season,
    team,
    standing: mapStanding(seasonData?.team),
    lineup: mapLineup(seasonData ?? {}),
  };
}
