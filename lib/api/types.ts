/**
 * Formes des réponses de f1api.dev.
 *
 * Écrites d'après les fixtures réelles de `docs/api/`, y compris leurs
 * incohérences — ce sont elles qui font les bugs :
 *
 * - `circuit` est un objet sur `/last` et sur la liste d'une saison, mais un
 *   tableau d'un élément quand on interroge une manche explicite ;
 * - les champs numériques arrivent tantôt en nombre, tantôt en chaîne, et
 *   parfois avec des valeurs textuelles (`"NC"`, `"not available"`) ;
 * - l'endpoint pilote-saison utilise d'autres noms pour le circuit
 *   (`name`, `length`, `numberOfCorners`) que le reste de l'API ;
 * - `firstAppareance` porte bien cette faute de frappe côté API.
 *
 * Tout est optionnel : on ne peut rien exiger d'une API publique dont on ne
 * maîtrise pas le contrat. Le gain n'est pas la garantie, c'est que le
 * compilateur refuse désormais un nom de champ inventé.
 */

/** Nombre ou chaîne : l'API mélange les deux sur les positions et les points. */
export type ApiNumeric = number | string | null;

export type ApiDriver = {
  driverId?: string;
  name?: string;
  surname?: string;
  nationality?: string;
  country?: string;
  birthday?: string | null;
  number?: number | null;
  shortName?: string | null;
  url?: string | null;
  teamId?: string | null;
};

export type ApiTeam = {
  teamId?: string;
  teamName?: string;
  nationality?: string;
  country?: string;
  teamNationality?: string;
  /**
   * Première saison de l'écurie. f1api.dev l'écrit de **trois** façons selon
   * l'endpoint — les deux fautes de frappe sont les leurs, pas les nôtres :
   * `firstAppareance` sur les classements et résultats de course,
   * `firstAppeareance` sur les endpoints écurie,
   * `firstAppearance` (correct) sur l'endpoint pilote-saison.
   * Révélé par le typage en écrivant la fiche écurie.
   */
  firstAppareance?: number;
  firstAppeareance?: number;
  firstAppearance?: number;
  constructorsChampionships?: number;
  driversChampionships?: number;
  url?: string | null;
};

export type ApiCircuit = {
  circuitId?: string;
  circuitName?: string;
  country?: string | null;
  city?: string | null;
  circuitLength?: string | null;
  lapRecord?: string | null;
  firstParticipationYear?: number | null;
  corners?: number | null;
  fastestLapDriverId?: string | null;
  fastestLapTeamId?: string | null;
  fastestLapYear?: number | null;
  url?: string | null;
};

export type ApiScheduleEntry = { date?: string | null; time?: string | null };

export type ApiSchedule = {
  fp1?: ApiScheduleEntry;
  fp2?: ApiScheduleEntry;
  fp3?: ApiScheduleEntry;
  qualy?: ApiScheduleEntry;
  sprintQualy?: ApiScheduleEntry;
  sprintRace?: ApiScheduleEntry;
  race?: ApiScheduleEntry;
};

export type ApiRaceResult = {
  position?: ApiNumeric;
  points?: ApiNumeric;
  grid?: ApiNumeric;
  time?: string | null;
  fastLap?: string | null;
  fastLapSpeed?: string | null;
  fastestLapRank?: ApiNumeric;
  fastestLapLap?: ApiNumeric;
  retired?: string | null;
  driver?: ApiDriver;
  team?: ApiTeam;
};

export type ApiQualyResult = {
  classificationId?: number;
  gridPosition?: ApiNumeric;
  position?: ApiNumeric;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  driver?: ApiDriver;
  team?: ApiTeam;
};

export type ApiSprintResult = {
  sprintRaceId?: number;
  position?: ApiNumeric;
  gridPosition?: ApiNumeric;
  points?: ApiNumeric;
  time?: string | null;
  retired?: string | null;
  driver?: ApiDriver;
  team?: ApiTeam;
};

export type ApiFreePracticeResult = {
  position?: ApiNumeric;
  time?: string | null;
  driver?: ApiDriver;
  team?: ApiTeam;
};

/** Une manche, telle que renvoyée par la liste d'une saison. */
export type ApiRace = {
  raceId?: string;
  raceName?: string;
  round?: ApiNumeric;
  date?: string | null;
  time?: string | null;
  laps?: number | null;
  url?: string | null;
  schedule?: ApiSchedule;
  /** Objet ou tableau d'un élément selon l'endpoint. */
  circuit?: ApiCircuit | ApiCircuit[];
  winner?: ApiDriver | null;
  teamWinner?: ApiTeam | null;
  results?: ApiRaceResult[];
  qualyResults?: ApiQualyResult[];
  sprintRaceResults?: ApiSprintResult[];
  fp1Results?: ApiFreePracticeResult[];
  fp2Results?: ApiFreePracticeResult[];
  fp3Results?: ApiFreePracticeResult[];
};

export type ApiSeasonResponse = {
  season?: ApiNumeric;
  total?: number;
  championship?: {
    championshipId?: string;
    championshipName?: string;
    url?: string;
    year?: number;
  };
  races?: ApiRace[];
};

/** Les endpoints d'une manche renvoient `races` en objet, pas en tableau. */
export type ApiRaceResponse = { season?: ApiNumeric; races?: ApiRace };

export type ApiDriversResponse = {
  drivers?: ApiDriver[];
  driver?: ApiDriver | ApiDriver[];
};

/** Endpoint pilote-saison : le circuit y porte d'autres noms de champs. */
export type ApiDriverSeasonCircuit = {
  circuitId?: string;
  name?: string;
  country?: string | null;
  city?: string | null;
  length?: number | null;
  lapRecord?: string | null;
  numberOfCorners?: number | null;
};

export type ApiDriverSeasonEntry = {
  race?: {
    raceId?: string;
    name?: string;
    raceName?: string;
    round?: ApiNumeric;
    date?: string | null;
    circuit?: ApiDriverSeasonCircuit;
    schedule?: ApiSchedule;
  };
  result?: {
    finishingPosition?: ApiNumeric;
    gridPosition?: ApiNumeric;
    raceTime?: string | null;
    pointsObtained?: ApiNumeric;
    retired?: string | null;
  };
  sprintResult?: {
    finishingPosition?: ApiNumeric;
    position?: ApiNumeric;
    pointsObtained?: ApiNumeric;
    points?: ApiNumeric;
  } | null;
};

export type ApiDriverSeasonResponse = {
  season?: ApiNumeric;
  driver?: ApiDriver;
  team?: ApiTeam;
  results?: ApiDriverSeasonEntry[];
};

export type ApiDriverChampionshipResponse = {
  drivers_championship?: Array<{
    classificationId?: number;
    teamId?: string;
    position?: ApiNumeric;
    points?: ApiNumeric;
    wins?: number;
    driver?: ApiDriver;
    team?: ApiTeam;
  }>;
};

export type ApiConstructorChampionshipResponse = {
  constructors_championship?: Array<{
    classificationId?: number;
    /** Présent au niveau de l'entrée ici, dans `team` sur le classement pilotes. */
    teamId?: string;
    position?: ApiNumeric;
    points?: ApiNumeric;
    wins?: number;
    team?: ApiTeam;
  }>;
};

/**
 * `circuit` arrive en objet sur la liste d'une saison et sur `/last`, mais en
 * tableau d'un élément quand on interroge une manche explicite. Trois sites
 * lisaient la forme objet sans normaliser — révélé par le typage.
 */
export function normalizeCircuit(
  circuit: ApiCircuit | ApiCircuit[] | undefined,
): ApiCircuit | undefined {
  return Array.isArray(circuit) ? circuit[0] : circuit;
}

/** `/api/teams/{id}` renvoie `team` en tableau d'un élément. */
export type ApiTeamResponse = { team?: ApiTeam | ApiTeam[] };

export type ApiTeamsResponse = { teams?: ApiTeam[] };

/** Le classement de la saison est fusionné dans l'objet équipe. */
export type ApiTeamWithStanding = ApiTeam & {
  points?: ApiNumeric;
  position?: ApiNumeric;
  wins?: ApiNumeric;
};

/** Chaque pilote est imbriqué sous une clé `driver`. */
export type ApiTeamDriversResponse = {
  season?: ApiNumeric;
  teamId?: string;
  team?: ApiTeamWithStanding;
  drivers?: Array<{
    driver?: ApiDriver & {
      points?: ApiNumeric;
      position?: ApiNumeric;
      wins?: ApiNumeric;
    };
  }>;
};

/** L'API renvoie tantôt un objet seul, tantôt un tableau. */
export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
