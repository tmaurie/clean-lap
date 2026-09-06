import { Team, TeamLineupDriver, TeamSeason } from "@/entities/team/model";
import { API_BASE_URL, fetchApiOrNull } from "@/lib/api/client";
import type {
  ApiTeam,
  ApiTeamDriversResponse,
  ApiTeamResponse,
  ApiTeamWithStanding,
} from "@/lib/api/types";
import { toArray } from "@/lib/api/types";

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
    nationality: team.teamNationality ?? team.nationality ?? null,
    // Trois orthographes possibles selon l'endpoint (cf. ApiTeam).
    firstSeason: toNumber(
      team.firstAppeareance ?? team.firstAppareance ?? team.firstAppearance,
    ),
    constructorsTitles: toNumber(team.constructorsChampionships) ?? 0,
    driversTitles: toNumber(team.driversChampionships) ?? 0,
    url: team.url ?? null,
  };
}

/** Fiche d'écurie hors saison. `null` si l'écurie n'existe pas. */
export async function fetchTeam(teamId: string): Promise<Team | null> {
  const json = await fetchApiOrNull<ApiTeamResponse>(
    `${API_BASE_URL}/teams/${teamId}`,
  );
  // Cet endpoint renvoie `team` en tableau d'un élément, là où les autres
  // renvoient un objet.
  const [team] = toArray(json?.team);
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
        nationality: driver.nationality ?? driver.country ?? null,
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

/**
 * Effectif et classement d'une écurie sur une saison donnée.
 *
 * Deux appels : la fiche hors saison (palmarès, première apparition) et
 * l'effectif de l'année, qui porte aussi le classement constructeurs. Ils
 * sont parallélisés — f1api.dev répond en ~4-5 s.
 *
 * `null` quand l'écurie n'a pas couru cette saison-là.
 */
export async function fetchTeamSeason(
  teamId: string,
  season: string,
): Promise<TeamSeason | null> {
  const [profile, seasonJson] = await Promise.all([
    fetchTeam(teamId),
    fetchApiOrNull<ApiTeamDriversResponse>(
      `${API_BASE_URL}/${season}/teams/${teamId}/drivers`,
      { season },
    ),
  ]);

  if (!profile && !seasonJson?.team) return null;

  const team = profile ?? mapTeam(seasonJson?.team ?? {}, teamId);

  return {
    season,
    team,
    standing: mapStanding(seasonJson?.team),
    lineup: mapLineup(seasonJson ?? {}),
  };
}
