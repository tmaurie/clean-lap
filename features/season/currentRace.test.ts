import { afterEach, describe, expect, it, vi } from "vitest";

import { Race } from "@/entities/race/model";

import { resolveCurrentRace } from "./currentRace";

const race = (
  round: number | null,
  date: string,
  time: string | null,
): Race => ({
  round,
  name: `GP ${round}`,
  circuit: "Circuit",
  date,
  time,
  location: "Ville, Pays",
});

const CALENDAR: Race[] = [
  race(1, "2026-03-08", "15:00:00Z"),
  race(2, "2026-03-22", "15:00:00Z"),
  race(3, "2026-04-05", "15:00:00Z"),
];

afterEach(() => {
  vi.useRealTimers();
});

function at(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe("resolveCurrentRace", () => {
  it("désigne la première manche non terminée", () => {
    at("2026-03-15T00:00:00Z");

    const current = resolveCurrentRace(CALENDAR);
    expect(current.round).toBe(2);
    expect(current.index).toBe(1);
    expect(current.total).toBe(3);
  });

  it("garde la manche du jour tant qu'elle n'a pas été courue", () => {
    // Le matin du GP : la course est à 15 h, il est 9 h.
    at("2026-03-22T09:00:00Z");
    expect(resolveCurrentRace(CALENDAR).round).toBe(2);

    // Le soir, on passe à la suivante.
    at("2026-03-22T18:00:00Z");
    expect(resolveCurrentRace(CALENDAR).round).toBe(3);
  });

  it("trie le calendrier même si l'API le renvoie en désordre", () => {
    at("2026-03-15T00:00:00Z");

    const shuffled = [CALENDAR[2], CALENDAR[0], CALENDAR[1]];
    const current = resolveCurrentRace(shuffled);

    expect(current.calendar.map((r) => r.round)).toEqual([1, 2, 3]);
    expect(current.round).toBe(2);
  });

  it("reprend le numéro de manche de l'API, pas la position", () => {
    at("2026-01-01T00:00:00Z");

    // Une saison dont le calendrier ne commence pas à la manche 1.
    const partial = [race(11, "2026-03-08", "15:00:00Z")];
    expect(resolveCurrentRace(partial).round).toBe(11);
  });

  it("retombe sur l'index quand l'API ne fournit pas de round", () => {
    at("2026-01-01T00:00:00Z");

    const withoutRound = [race(null, "2026-03-08", "15:00:00Z")];
    expect(resolveCurrentRace(withoutRound).round).toBe(1);
  });

  it("signale une saison terminée", () => {
    at("2026-12-31T00:00:00Z");

    const current = resolveCurrentRace(CALENDAR);
    expect(current.index).toBe(-1);
    expect(current.race).toBeNull();
    expect(current.round).toBeNull();
    expect(current.total).toBe(3);
  });

  it("supporte un calendrier vide", () => {
    at("2026-03-15T00:00:00Z");

    expect(resolveCurrentRace([])).toMatchObject({
      index: -1,
      race: null,
      round: null,
      total: 0,
    });
  });
});
