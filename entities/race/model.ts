export type Race = {
  name: string;
  circuit: string;
  date: string; // ISO
  time: string; // UTC time
  location: string;
};

export type RaceResult = {
  position: string;
  driver: string;
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
