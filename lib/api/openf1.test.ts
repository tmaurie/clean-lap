import { expect, it, vi } from "vitest";
import { loadPractice } from "./openf1";
import { stubProvider } from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

const melbourne = {
  date: "2025-03-16",
  circuit: { circuitId: "albert_park", city: "Melbourne" },
  schedule: { fp1: { date: "2025-03-14", time: "01:30:00Z" } },
};

const australianRace = {
  meeting_key: 1254,
  session_key: 9690,
  session_name: "Race",
  circuit_short_name: "Melbourne",
  location: "Melbourne",
  date_start: "2025-03-16T04:00:00+00:00",
  date_end: "2025-03-16T06:00:00+00:00",
};

const australianPractice = {
  ...australianRace,
  session_name: "Practice 1",
  session_key: 9686,
  date_start: "2025-03-14T01:30:00+00:00",
  date_end: "2025-03-14T02:30:00+00:00",
};

const recent = {
  ...melbourne,
  date: "2027-03-16",
  schedule: { fp1: { date: "2027-03-14", time: "01:30:00Z" } },
};

function sessionIn2027<T extends { date_start: string; date_end: string }>(
  session: T,
): T {
  return {
    ...session,
    date_start: session.date_start.replace("2025", "2027"),
    date_end: session.date_end.replace("2025", "2027"),
  };
}

const sessions = [
  sessionIn2027(australianRace),
  sessionIn2027(australianPractice),
];

it("joint par numéro de voiture dans la bonne manche et formate le temps", async () => {
  stubProvider({
    "sessions?year=2027": [
      {
        ...sessions[0],
        location: "Monza",
        circuit_short_name: "Monza",
        meeting_key: 1,
      },
      ...sessions,
    ],
    "session_result?session_key=9686": [
      { position: 2, driver_number: 55, duration: 77.401 },
      { position: 1, driver_number: 4, duration: 77.252 },
    ],
    "drivers?session_key=9686": [
      {
        driver_number: 4,
        first_name: "Lando",
        last_name: "Norris",
        team_name: "McLaren",
        country_code: "GBR",
      },
      {
        driver_number: 55,
        first_name: "Carlos",
        last_name: "Sainz",
        team_name: "Williams",
      },
    ],
  });

  await expect(
    loadPractice(recent, "fp1", new Date("2027-03-14T03:20:00Z")),
  ).resolves.toEqual({
    status: "available",
    results: [
      {
        position: "1",
        driver: "Lando Norris",
        constructor: "McLaren",
        driverNationality: "British",
        time: "1:17.252",
      },
      {
        position: "2",
        driver: "Carlos Sainz",
        constructor: "Williams",
        driverNationality: undefined,
        time: "1:17.401",
      },
    ],
  });
});

it("attend la fin de la fenêtre d'accès restreinte", async () => {
  const request = stubProvider({ "sessions?year=2027": sessions });
  await expect(
    loadPractice(recent, "fp1", new Date("2027-03-14T02:45:00Z")),
  ).resolves.toEqual({
    results: [],
    status: "pending",
  });
  expect(request).toHaveBeenCalledTimes(1);
});

it("utilise F1DB lorsque les essais sont antérieurs à OpenF1", async () => {
  const request = stubProvider({});
  await expect(
    loadPractice(
      {
        date: "2022-07-03",
        circuit: { circuitId: "silverstone" },
      },
      "fp1",
      new Date("2026-01-01"),
    ),
  ).resolves.toMatchObject({
    status: "available",
    results: expect.arrayContaining([
      {
        position: "1",
        driver: "Valtteri Bottas",
        driverNationality: "Finnish",
        constructor: "Alfa Romeo",
        time: "1:42.249",
      },
    ]),
  });
  expect(request).not.toHaveBeenCalled();
});

it("utilise F1DB si la source d'essais est en panne et indique le manque sinon", async () => {
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  stubProvider({
    "sessions?year=2025": new Error("HTTP 429"),
    "sessions?year=2027": new Error("HTTP 503"),
  });
  await expect(
    loadPractice(melbourne, "fp1", new Date("2025-03-14T03:30:00Z")),
  ).resolves.toMatchObject({ status: "available", results: expect.any(Array) });
  await expect(
    loadPractice(recent, "fp1", new Date("2027-03-14T03:30:00Z")),
  ).resolves.toEqual({ status: "unavailable", results: [] });
  log.mockRestore();
});
