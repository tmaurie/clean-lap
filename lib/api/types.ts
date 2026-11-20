/** Données normalisées à la frontière des fournisseurs. */
export type ApiNumeric = number | string | null;

export type ApiDriver = {
  driverId?: string;
  name?: string;
  surname?: string;
  nationality?: string;
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
  firstAppearance?: number | null;
  constructorsChampionships?: number;
  driversChampionships?: number;
  url?: string | null;
};

export type ApiCircuit = {
  circuitId?: string;
  circuitName?: string;
  country?: string | null;
  city?: string | null;
  circuitLength?: number | null;
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
  position?: ApiNumeric;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  driver?: ApiDriver;
  team?: ApiTeam;
};

export type ApiSprintResult = {
  laps?: string;
  position?: ApiNumeric;
  gridPosition?: ApiNumeric;
  points?: ApiNumeric;
  time?: string | null;
  retired?: string | null;
  driver?: ApiDriver;
  team?: ApiTeam;
};

/** Une manche, telle que renvoyée par la liste d'une saison. */
export type ApiRace = {
  raceName?: string;
  round?: ApiNumeric;
  date?: string | null;
  time?: string | null;
  laps?: number | null;
  url?: string | null;
  schedule?: ApiSchedule;
  circuit?: ApiCircuit;
  winner?: ApiDriver | null;
  teamWinner?: ApiTeam | null;
  results?: ApiRaceResult[];
  qualyResults?: ApiQualyResult[];
  sprintRaceResults?: ApiSprintResult[];
};

export type ApiDriverSeasonEntry = {
  race?: {
    name?: string;
    round?: ApiNumeric;
    date?: string | null;
    circuit?: Pick<ApiCircuit, "city" | "country">;
  };
  result?: {
    finishingPosition?: ApiNumeric;
    gridPosition?: ApiNumeric;
    pointsObtained?: ApiNumeric;
    retired?: string | null;
  };
  sprintResult?: {
    position?: ApiNumeric;
    points?: ApiNumeric;
  } | null;
};

export type ApiDriverSeasonResponse = {
  driver?: ApiDriver;
  team?: ApiTeam;
  results?: ApiDriverSeasonEntry[];
};

/** Le classement de la saison est fusionné dans l'objet équipe. */
export type ApiTeamWithStanding = ApiTeam & {
  points?: ApiNumeric;
  position?: ApiNumeric;
  wins?: ApiNumeric;
};

/** Chaque pilote est imbriqué sous une clé `driver`. */
export type ApiTeamDriversResponse = {
  team?: ApiTeamWithStanding;
  drivers?: Array<{
    driver?: ApiDriver & {
      points?: ApiNumeric;
      position?: ApiNumeric;
      wins?: ApiNumeric;
    };
  }>;
};
