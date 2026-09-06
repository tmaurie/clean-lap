export type Team = {
  id: string;
  name: string;
  nationality: string | null;
  firstSeason: number | null;
  constructorsTitles: number;
  driversTitles: number;
  url: string | null;
};

/** Un pilote tel qu'il apparaît dans l'effectif d'une écurie sur une saison. */
export type TeamLineupDriver = {
  id: string;
  name: string;
  surname: string;
  nationality: string | null;
  number: number | null;
  shortName: string | null;
  points: number | null;
  position: number | null;
  wins: number | null;
};

export type TeamSeason = {
  season: string;
  team: Team;
  /** Classement constructeurs de la saison, absent si non communiqué. */
  standing: {
    position: number | null;
    points: number | null;
    wins: number | null;
  } | null;
  lineup: TeamLineupDriver[];
};
