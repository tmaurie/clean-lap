const API_BASE_URL = "https://f1api.dev/api";

const DEFAULT_HEADERS = { Accept: "application/json" } as const;

type QueryParams = Record<string, string | number | undefined>;

async function request<T>(
  endpoint: string,
  params?: QueryParams,
): Promise<T> {
  const url = new URL(endpoint, `${API_BASE_URL}/`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    cache: "force-cache",
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }

  return (await response.json()) as T;
}

type Circuit = {
  circuitId: string;
  circuitName: string;
  country: string;
  city: string;
  circuitLength: string | number;
  lapRecord: string;
  firstParticipationYear: number;
  numberOfCorners: number;
  fastestLapDriverId: string;
  fastestLapTeamId: string;
  fastestLapYear: number;
  url: string;
};

type Driver = {
  driverId: string;
  name: string;
  surname: string;
  nationality: string;
  birthday: string;
  number: number | null;
  shortName: string | null;
  url: string;
};

type Team = {
  teamId: string;
  teamName: string;
  country?: string;
  teamNationality?: string;
  firstAppeareance: number | null;
  constructorsChampionships: number | null;
  driversChampionships: number | null;
  url: string;
};

type Race = {
  raceId: string;
  championshipId: string;
  raceName: string;
  schedule: {
    race?: { date: string; time: string };
    qualy?: { date: string; time: string } | null;
    fp1?: { date: string; time: string } | null;
    fp2?: { date: string; time: string } | null;
    fp3?: { date: string; time: string } | null;
    sprintQualy?: { date: string; time: string } | null;
    sprintRace?: { date: string; time: string } | null;
  };
  laps: number;
  round: number;
  url: string;
  fast_lap?: {
    fast_lap: string;
    fast_lap_driver_id: string;
    fast_lap_team_id: string;
  };
  circuit: {
    circuitId: string;
    circuitName: string;
    country: string;
    city: string;
    circuitLength: string;
    lapRecord: string;
    firstParticipationYear: number;
    corners: number;
    fastestLapDriverId: string;
    fastestLapTeamId: string;
    fastestLapYear: number;
    url: string;
  };
  winner: {
    driverId: string;
    name: string;
    surname: string;
    country: string;
    birthday: string;
    number: number | null;
    shortName: string | null;
    url: string;
  } | null;
  teamWinner: Team | null;
};

type RacesApiResponse = {
  season: string | number;
  championship: {
    championshipId: string;
    championshipName: string;
    url: string;
    year: number;
  };
  races: Race[];
};

type RaceApiResponse = {
  season: string | number;
  championship: {
    championshipId: string;
    championshipName: string;
    url: string;
    year: number;
  };
  race: Race[];
};

type RaceClassification = {
  position: number;
  points: number;
  grid: number;
  laps: number;
  time: string;
  fastLap: string | null;
  retired: boolean | null;
  driver: Driver;
  team: Team;
};

type RaceResultsApiResponse = {
  season: string | number;
  races: {
    round: string | number;
    date: string;
    time: string;
    url: string;
    raceId: string;
    raceName: string;
    circuit: Circuit;
    results: RaceClassification[];
  };
};

type SprintRaceResultsApiResponse = {
  season: string | number;
  races: {
    round: string | number;
    date: string;
    time: string;
    url: string;
    raceId: string;
    raceName: string;
    circuit: Circuit;
    sprintRaceResults: Array<
      RaceClassification & { gridPosition: number; points: number }
    >;
  };
};

type QualyResultsApiResponse = {
  season: string | number;
  races: {
    round: string | number;
    qualyDate: string;
    qualyTime: string;
    url: string;
    raceId: string;
    raceName: string;
    circuit: Circuit;
    qualyResults: Array<
      RaceClassification & {
        q1: string;
        q2: string;
        q3: string;
        gridPosition: number;
      }
    >;
  };
};

type DriverStandingsApiResponse = {
  season: string | number;
  championshipId: string;
  drivers_championship: Array<{
    classificationId: number;
    driverId: string;
    teamId: string;
    points: number;
    position: number;
    wins: number | null;
    driver: Driver;
    team: Team;
  }>;
};

type ConstructorStandingsApiResponse = {
  season: string | number;
  championshipId: string;
  constructors_championship: Array<{
    classificationId: number;
    teamId: string;
    points: number;
    position: number;
    wins: number | null;
    team: Team;
  }>;
};

class F1Api {
  async getRacesByYear({
    year,
    limit,
    offset,
  }: {
    year: number;
    limit?: number;
    offset?: number;
  }): Promise<RacesApiResponse> {
    return request<RacesApiResponse>("races", { year, limit, offset });
  }

  async getRaceInfo({
    year,
    round,
  }: {
    year: number;
    round: number;
  }): Promise<RaceApiResponse> {
    return request<RaceApiResponse>(`races/${year}/${round}`);
  }

  async getNextRace(): Promise<RaceApiResponse> {
    return request<RaceApiResponse>("races/next");
  }

  async getLastRace(): Promise<RaceApiResponse> {
    return request<RaceApiResponse>("races/last");
  }

  async getRaceResults({
    year,
    round,
    limit,
    offset,
  }: {
    year: number;
    round: number;
    limit?: number;
    offset?: number;
  }): Promise<RaceResultsApiResponse> {
    return request<RaceResultsApiResponse>("results/race", {
      year,
      round,
      limit,
      offset,
    });
  }

  async getSprintRaceResults({
    year,
    round,
    limit,
    offset,
  }: {
    year: number;
    round: number;
    limit?: number;
    offset?: number;
  }): Promise<SprintRaceResultsApiResponse> {
    return request<SprintRaceResultsApiResponse>("results/sprint-race", {
      year,
      round,
      limit,
      offset,
    });
  }

  async getQualyResults({
    year,
    round,
    limit,
    offset,
  }: {
    year: number;
    round: number;
    limit?: number;
    offset?: number;
  }): Promise<QualyResultsApiResponse> {
    return request<QualyResultsApiResponse>("results/qualy", {
      year,
      round,
      limit,
      offset,
    });
  }

  async getDriverStandings({
    year,
    limit,
    offset,
  }: {
    year: number;
    limit?: number;
    offset?: number;
  }): Promise<DriverStandingsApiResponse> {
    return request<DriverStandingsApiResponse>("standings/drivers", {
      year,
      limit,
      offset,
    });
  }

  async getConstructorStandings({
    year,
    limit,
    offset,
  }: {
    year: number;
    limit?: number;
    offset?: number;
  }): Promise<ConstructorStandingsApiResponse> {
    return request<ConstructorStandingsApiResponse>("standings/constructors", {
      year,
      limit,
      offset,
    });
  }
}

export type {
  RacesApiResponse,
  RaceApiResponse,
  RaceResultsApiResponse,
  SprintRaceResultsApiResponse,
  QualyResultsApiResponse,
  DriverStandingsApiResponse,
  ConstructorStandingsApiResponse,
  Race,
  RaceClassification,
};

export default F1Api;
