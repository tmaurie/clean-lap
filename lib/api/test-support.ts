import { vi } from "vitest";
import { requestData } from "./client";

export const constructor = {
  constructorId: "red_bull",
  name: "Red Bull",
  nationality: "Austrian",
};

export const verstappen = {
  driverId: "max_verstappen",
  givenName: "Max",
  familyName: "Verstappen",
  permanentNumber: "33",
  code: "VER",
  nationality: "Dutch",
};

export const zhou = {
  driverId: "zhou",
  givenName: "Guanyu",
  familyName: "Zhou",
  nationality: "Chinese",
  code: "ZHO",
};

export const monza = {
  circuitId: "monza",
  circuitName: "Autodromo Nazionale di Monza",
  Location: { locality: "Monza", country: "Italy" },
};

export const grandPrix = {
  season: "2025",
  round: "16",
  raceName: "Italian Grand Prix",
  date: "2025-09-07",
  time: "13:00:00Z",
  Circuit: monza,
};

export const classification = {
  position: "1",
  positionText: "1",
  grid: "2",
  points: "25",
  status: "Finished",
  Driver: verstappen,
  Constructor: constructor,
};

export function envelope(
  table: string,
  field: string,
  rows: unknown[],
  { total = rows.length, offset = 0, limit = 100 } = {},
) {
  return {
    MRData: {
      limit: String(limit),
      offset: String(offset),
      total: String(total),
      [table]: { [field]: rows },
    },
  };
}

export function raceTable(races: unknown[]) {
  return envelope("RaceTable", "Races", races);
}

export function stubProvider(
  routes: Record<string, unknown>,
  defaults: (path: string) => unknown = (path) =>
    new Error(`Unexpected endpoint: ${path}`),
) {
  return vi
    .mocked(requestData)
    .mockReset()
    .mockImplementation(async (_provider, url) => {
      const path = url.replace(/\/\?limit=(?:100|1)&offset=0$/, "");
      const response = Object.hasOwn(routes, path)
        ? routes[path]
        : defaults(path);
      if (response instanceof Error) throw response;
      return response as never;
    });
}
