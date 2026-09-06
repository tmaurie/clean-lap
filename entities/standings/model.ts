export type DriverStanding = {
  position: string;
  wins: number;
  driver: string;
  constructor: string;
  /** Identifiant de l'écurie, pour lier vers sa fiche. `null` si absent. */
  constructorId: string | null;
  points: string;
  nationality: string;
};

export type ConstructorStanding = {
  position: string;
  constructor: string;
  /** Identifiant de l'écurie, pour lier vers sa fiche. `null` si absent. */
  constructorId: string | null;
  points: string;
  wins: number;
  nationality: string;
};
