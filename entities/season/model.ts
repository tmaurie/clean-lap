export type Season = {
  season: string;
  raceCount: number;
  driverChampion?: { name: string; nationality: string };
  constructorChampion?: string;
};
