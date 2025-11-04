export const API_BASE_URL = "https://f1api.dev/api";

const withQuery = (
  path: string,
  params?: Record<string, string | number | undefined>,
) => {
  const url = new URL(path, `${API_BASE_URL}/`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

export const API_ROUTES = {
  seasons: (params?: { limit?: number; offset?: number }) =>
    withQuery("seasons", params),
  circuits: (params?: { limit?: number; offset?: number }) =>
    withQuery("circuits", params),
  races: (year: string | number, params?: { limit?: number; offset?: number }) =>
    withQuery("races", { year, ...params }),
  nextRace: `${API_BASE_URL}/races/next`,
  lastRace: `${API_BASE_URL}/races/last`,
  raceInfo: (year: string | number, round: string | number) =>
    `${API_BASE_URL}/races/${year}/${round}`,
  raceResults: (year: string | number, round: string | number) =>
    withQuery("results/race", { year, round }),
  sprintRaceResults: (year: string | number, round: string | number) =>
    withQuery("results/sprint-race", { year, round }),
  qualifyingResults: (year: string | number, round: string | number) =>
    withQuery("results/qualy", { year, round }),
  driverStandings: (year: string | number) =>
    withQuery("standings/drivers", { year }),
  constructorStandings: (year: string | number) =>
    withQuery("standings/constructors", { year }),
};
