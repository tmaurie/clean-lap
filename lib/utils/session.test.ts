import { describe, expect, it } from "vitest";

import {
  buildWeekendSessions,
  currentOrNextSession,
  isSprintWeekend,
  isWeekendOver,
  sessionStatus,
} from "./session";

// Week-end classique : Monza 2026 (heures UTC réelles de l'API).
const CLASSIC_WEEKEND = {
  fp1: { date: "2026-09-04", time: "11:30:00Z" },
  fp2: { date: "2026-09-04", time: "15:00:00Z" },
  fp3: { date: "2026-09-05", time: "10:30:00Z" },
  qualy: { date: "2026-09-05", time: "14:00:00Z" },
  sprintQualy: { date: null, time: null },
  sprintRace: { date: null, time: null },
  race: { date: "2026-09-06", time: "13:00:00Z" },
};

// Week-end sprint : pas de FP2 ni FP3, mais SQ et course sprint.
const SPRINT_WEEKEND = {
  fp1: { date: "2026-10-23", time: "11:30:00Z" },
  fp2: { date: null, time: null },
  fp3: { date: null, time: null },
  sprintQualy: { date: "2026-10-23", time: "15:30:00Z" },
  sprintRace: { date: "2026-10-24", time: "11:00:00Z" },
  qualy: { date: "2026-10-24", time: "15:00:00Z" },
  race: { date: "2026-10-25", time: "14:00:00Z" },
};

describe("buildWeekendSessions", () => {
  it("écarte les sessions non programmées", () => {
    const sessions = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-01T00:00:00Z"),
    );

    expect(sessions.map((s) => s.key)).toEqual([
      "fp1",
      "fp2",
      "fp3",
      "qualy",
      "race",
    ]);
  });

  it("ordonne chronologiquement, y compris sur un week-end sprint", () => {
    const sessions = buildWeekendSessions(
      SPRINT_WEEKEND,
      new Date("2026-10-20T00:00:00Z"),
    );

    // L'ordre vient des horaires, pas d'un format codé en dur.
    expect(sessions.map((s) => s.key)).toEqual([
      "fp1",
      "sprintQualy",
      "sprintRace",
      "qualy",
      "race",
    ]);
  });

  it("marque les sessions passées, en cours et à venir", () => {
    // Samedi 14 h 30 UTC : la qualif a démarré à 14 h et dure ~1 h.
    const sessions = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-05T14:30:00Z"),
    );
    const byKey = Object.fromEntries(sessions.map((s) => [s.key, s.status]));

    expect(byKey).toEqual({
      fp1: "done",
      fp2: "done",
      fp3: "done",
      qualy: "live",
      race: "upcoming",
    });
  });

  it("bascule la session sur 'done' une fois sa durée écoulée", () => {
    const during = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-05T14:59:00Z"),
    );
    const after = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-05T15:01:00Z"),
    );

    expect(during.find((s) => s.key === "qualy")?.status).toBe("live");
    expect(after.find((s) => s.key === "qualy")?.status).toBe("done");
  });

  it("renvoie une liste vide sans planning exploitable", () => {
    expect(buildWeekendSessions({})).toEqual([]);
    expect(buildWeekendSessions({ race: { date: null, time: null } })).toEqual(
      [],
    );
  });
});

describe("sessionStatus", () => {
  const start = new Date("2026-09-06T13:00:00Z");
  const end = new Date("2026-09-06T15:30:00Z");

  it("compte l'instant de départ comme 'en cours'", () => {
    expect(sessionStatus(start, end, start)).toBe("live");
  });

  it("compte l'instant de fin comme 'terminé'", () => {
    expect(sessionStatus(start, end, end)).toBe("done");
  });

  it("est 'à venir' avant le départ", () => {
    expect(sessionStatus(start, end, new Date("2026-09-06T12:59:59Z"))).toBe(
      "upcoming",
    );
  });
});

describe("currentOrNextSession", () => {
  it("privilégie la session en cours", () => {
    const sessions = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-05T14:30:00Z"),
    );

    expect(currentOrNextSession(sessions)?.key).toBe("qualy");
  });

  it("retombe sur la prochaine session à venir", () => {
    const sessions = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-05T16:00:00Z"),
    );

    expect(currentOrNextSession(sessions)?.key).toBe("race");
  });

  it("renvoie null quand tout est terminé", () => {
    const sessions = buildWeekendSessions(
      CLASSIC_WEEKEND,
      new Date("2026-09-07T00:00:00Z"),
    );

    expect(currentOrNextSession(sessions)).toBeNull();
  });
});

describe("isSprintWeekend / isWeekendOver", () => {
  const now = new Date("2026-09-01T00:00:00Z");

  it("distingue les deux formats de week-end", () => {
    expect(isSprintWeekend(buildWeekendSessions(SPRINT_WEEKEND, now))).toBe(
      true,
    );
    expect(isSprintWeekend(buildWeekendSessions(CLASSIC_WEEKEND, now))).toBe(
      false,
    );
  });

  it("ne déclare le week-end terminé que quand tout l'est", () => {
    expect(isWeekendOver(buildWeekendSessions(CLASSIC_WEEKEND, now))).toBe(
      false,
    );
    expect(
      isWeekendOver(
        buildWeekendSessions(CLASSIC_WEEKEND, new Date("2026-09-07T00:00:00Z")),
      ),
    ).toBe(true);
  });

  it("ne considère pas un planning vide comme terminé", () => {
    expect(isWeekendOver([])).toBe(false);
  });
});
