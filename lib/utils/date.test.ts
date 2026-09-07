import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatRaceDay,
  formatSessionDay,
  formatSessionTime,
  isPastRace,
  toRaceDate,
} from "./date";

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

describe("formatage des horaires de session", () => {
  // Monza 2026, départ à 13 h UTC — soit 15 h à Paris (heure d'été).
  const start = new Date("2026-09-06T13:00:00Z");

  it("affiche le jour en français", () => {
    expect(formatSessionDay(start)).toBe("dim. 6 sept.");
  });

  it("affiche l'heure dans le fuseau d'affichage, pas celui de l'hôte", () => {
    // Le test doit donner le même résultat sur une machine en UTC et sur une
    // machine à Paris : c'est tout l'intérêt du fuseau figé.
    expect(formatSessionTime(start)).toBe("15:00");
  });

  it("gère le passage à l'heure d'hiver", () => {
    // Abou Dabi en décembre : 13 h UTC = 14 h à Paris.
    expect(formatSessionTime(new Date("2026-12-06T13:00:00Z"))).toBe("14:00");
  });
});

describe("formatRaceDay", () => {
  it("ne décale pas une date sans heure", () => {
    // `toRaceDate` vise 23:59:59 UTC quand l'heure est inconnue : formaté à
    // Paris, ça basculait au lendemain. Le GP d'Italie 2024, couru le 1er
    // septembre, s'affichait « 2 septembre ».
    expect(formatRaceDay("2024-09-01")).toBe("1 septembre 2024");
  });

  it("utilise l'heure de Paris quand l'heure est connue", () => {
    // 22:30 UTC le 31 décembre = 23:30 à Paris, toujours le 31.
    expect(formatRaceDay("2024-12-31", "22:30:00Z")).toBe("31 décembre 2024");
  });

  it("bascule bien de jour quand l'heure le justifie", () => {
    // 23:30 UTC = 00:30 à Paris, donc le lendemain.
    expect(formatRaceDay("2024-12-31", "23:30:00Z")).toBe("1 janvier 2025");
  });

  it("accepte un format personnalisé", () => {
    expect(
      formatRaceDay("2024-09-01", null, { day: "2-digit", month: "short" }),
    ).toBe("01 sept.");
  });

  it("renvoie null sur une date inexploitable", () => {
    expect(formatRaceDay(null)).toBeNull();
    expect(formatRaceDay("pas-une-date")).toBeNull();
  });
});
