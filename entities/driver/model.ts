export type Driver = {
  id: string;
  name: string;
  surname: string;
  nationality?: string | null;
  birthday?: string | null;
  number?: number | null;
  shortName?: string | null;
  url?: string | null;
  teamId?: string | null;
};

export type DriverRaceResult = {
  round: number | string | null;
  raceName: string;
  date: string | null;
  grid: number | string | null;
  position: number | string | null;
  sprintPosition?: number | string | null;
  sprintPoints?: number | null;
  points: number | string | null; // total points for the event (race + sprint)
  status?: string | null;
  location?: string | null;
};

export type DriverSeason = {
  season: string;
  driver: Driver;
  races: DriverRaceResult[];
  stats: {
    wins: number;
    podiums: number;
    points: number;
    avgGrid: number | null;
  };
};
