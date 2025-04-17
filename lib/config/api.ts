export const API_BASE_URL = "https://api.jolpi.ca/ergast/f1";

export const API_ROUTES = {
  season: `${API_BASE_URL}/seasons`,
  circuit: `${API_BASE_URL}/circuits`,
  races: (year = "2025") => `${API_BASE_URL}/${year}/races`,
  results: (year = "2025", round: number) =>
    `${API_BASE_URL}/${year}/${round}/results`,
  nextRace: `${API_BASE_URL}/current/next.json`,
  drivers: (year = "2025") => `${API_BASE_URL}/${year}/drivers`,
  driverStandings: (year = "2025") => `${API_BASE_URL}/${year}/driverstandings`,
  constructorStandings: (year = "2025") =>
    `${API_BASE_URL}/${year}/constructorstandings`,
  pitstops: (year = "2025", round: number) =>
    `${API_BASE_URL}/${year}/${round}/pitstops`,
  laps: (year = "2025", round: number) =>
    `${API_BASE_URL}/${year}/${round}/laps`,
};
