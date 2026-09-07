export type Race = {
  /** Numéro de manche tel que renvoyé par l'API (pas l'index du tableau). */
  round: number | null;
  name: string;
  circuit: string;
  /** Identifiant du circuit, pour lier vers sa fiche. `null` si absent. */
  circuitId: string | null;
  date: string; // ISO (YYYY-MM-DD)
  time: string | null; // heure UTC ("14:00:00Z"), absente sur certaines saisons
  location: string;
};

export type RaceResult = {
  position: string;
  driver: string;
  driverNationality?: string;
  constructor: string;
  time: string;
  points: string;
  fastestLap?: {
    rank: string;
    lap: string;
    time: string;
    averageSpeed: string;
  };
  grid: string;
  laps?: string;
};
