export type Circuit = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  /** Longueur en mètres. L'API la donne tantôt en nombre, tantôt en `"5793km"`. */
  lengthMeters: number | null;
  corners: number | null;
  firstSeason: number | null;
  url: string | null;
  lapRecord: {
    time: string;
    driverId: string | null;
    teamId: string | null;
    year: number | null;
  } | null;
};

/** La manche disputée sur ce circuit pour une saison donnée. */
export type CircuitRace = {
  round: number | null;
  name: string;
  date: string | null;
  winner: string | null;
  winnerTeamId: string | null;
};
