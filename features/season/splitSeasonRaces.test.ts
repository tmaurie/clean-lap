import { describe, expect, it } from "vitest";

import { isThisWeekend, splitSeasonRaces } from "./splitSeasonRaces";

const NOW = new Date("2026-09-09T12:00:00Z");

const races = [
  { round: "1", date: "2026-03-08", time: "15:00:00Z", winner: undefined },
  { round: "2", date: "2026-09-06", time: "13:00:00Z", winner: undefined },
  { round: "3", date: "2026-09-13", time: "15:00:00Z", winner: undefined },
  { round: "4", date: "2026-11-22", time: "18:00:00Z", winner: undefined },
];

describe("splitSeasonRaces", () => {
  it("sépare sur la date, pas sur le vainqueur", () => {
    // Le cœur du bug : aucune de ces manches n'a de vainqueur renseigné, ce
    // qui est le cas de toutes les saisons d'avant 2024 chez f1api.dev.
    const { completed, remaining } = splitSeasonRaces(races, NOW);

    expect(completed.map((r) => r.round)).toEqual(["1", "2"]);
    expect(remaining.map((r) => r.round)).toEqual(["3", "4"]);
  });

  it("compte une course du jour comme à venir tant qu'elle n'est pas partie", () => {
    const { completed, remaining } = splitSeasonRaces(
      [{ date: "2026-09-09", time: "15:00:00Z" }],
      NOW,
    );

    expect(completed).toHaveLength(0);
    expect(remaining).toHaveLength(1);
  });

  it("sans heure connue, une course du jour reste à venir", () => {
    // `toRaceDate` vise la fin de la journée UTC : sinon un GP couru à 15 h
    // serait marqué passé dès minuit.
    const { remaining } = splitSeasonRaces([{ date: "2026-09-09" }], NOW);

    expect(remaining).toHaveLength(1);
  });

  it("rend deux listes vides pour une saison vide", () => {
    expect(splitSeasonRaces([], NOW)).toEqual({ completed: [], remaining: [] });
  });
});

describe("isThisWeekend", () => {
  it("reconnaît une manche à moins de sept jours", () => {
    expect(isThisWeekend({ date: "2026-09-13", time: "15:00:00Z" }, NOW)).toBe(
      true,
    );
  });

  it("refuse une manche à plus de sept jours", () => {
    // Sans ce garde-fou, la première manche restante portait « Ce week-end »
    // même à deux mois d'échéance.
    expect(isThisWeekend({ date: "2026-11-22", time: "18:00:00Z" }, NOW)).toBe(
      false,
    );
  });

  it("refuse une manche déjà courue", () => {
    expect(isThisWeekend({ date: "2026-09-06", time: "13:00:00Z" }, NOW)).toBe(
      false,
    );
  });

  it("refuse une date illisible", () => {
    expect(isThisWeekend({ date: "" }, NOW)).toBe(false);
  });
});
