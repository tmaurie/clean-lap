import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isPastRace, toRaceDate } from "./date";

// Le GP d'Italie 2026 part le 6 septembre à 15 h UTC : on fige l'horloge
// pendant la matinée du jour de course, le cas que l'ancienne version ratait.
const RACE_DATE = "2026-09-06";
const RACE_TIME = "15:00:00Z";

describe("toRaceDate", () => {
  it("combine la date et l'heure UTC de l'API", () => {
    expect(toRaceDate(RACE_DATE, RACE_TIME)?.toISOString()).toBe(
      "2026-09-06T15:00:00.000Z",
    );
  });

  it("tolère une heure sans suffixe Z", () => {
    expect(toRaceDate(RACE_DATE, "15:00:00")?.toISOString()).toBe(
      "2026-09-06T15:00:00.000Z",
    );
  });

  it("vise la fin de journée quand l'heure est inconnue", () => {
    expect(toRaceDate(RACE_DATE, null)?.toISOString()).toBe(
      "2026-09-06T23:59:59.000Z",
    );
    expect(toRaceDate(RACE_DATE)?.toISOString()).toBe(
      "2026-09-06T23:59:59.000Z",
    );
  });

  it("renvoie null sur une entrée inexploitable", () => {
    expect(toRaceDate("")).toBeNull();
    expect(toRaceDate(null)).toBeNull();
    expect(toRaceDate("pas-une-date")).toBeNull();
    expect(toRaceDate(RACE_DATE, "99:99:99Z")).toBeNull();
  });
});

describe("isPastRace", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("le matin du jour de course", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-06T09:00:00Z"));
    });

    it("ne considère pas la course du jour comme terminée", () => {
      // Le bug historique : la date seule valait minuit UTC, donc la course
      // était marquée passée dès 00 h 00 et la home affichait la manche
      // suivante pendant toute la journée.
      expect(isPastRace(RACE_DATE, RACE_TIME)).toBe(false);
    });

    it("ne la considère pas terminée non plus sans heure connue", () => {
      expect(isPastRace(RACE_DATE)).toBe(false);
    });

    it("considère bien la manche précédente comme terminée", () => {
      expect(isPastRace("2026-08-30", "15:00:00Z")).toBe(true);
    });
  });

  describe("le soir du jour de course", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-06T18:00:00Z"));
    });

    it("considère la course comme terminée", () => {
      expect(isPastRace(RACE_DATE, RACE_TIME)).toBe(true);
    });

    it("attend la fin de journée quand l'heure est inconnue", () => {
      expect(isPastRace(RACE_DATE)).toBe(false);
    });
  });

  it("ne marque pas comme passée une date invalide", () => {
    expect(isPastRace("pas-une-date")).toBe(false);
    expect(isPastRace("")).toBe(false);
  });
});
