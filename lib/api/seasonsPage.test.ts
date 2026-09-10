import { describe, expect, it } from "vitest";

import {
  EARLIEST_SEASON,
  SEASONS_PAGE_SIZE,
  parseSeasonsPage,
  seasonsCacheControl,
  seasonsPageCount,
} from "./seasonsPage";

const NOW = new Date("2026-09-10T12:00:00Z");

describe("seasonsPageCount", () => {
  it("couvre toutes les saisons depuis 1950", () => {
    // 1950 à 2026 = 77 saisons, soit 7 pages de 12.
    const total = 2026 - EARLIEST_SEASON + 1;
    expect(seasonsPageCount(NOW)).toBe(Math.ceil(total / SEASONS_PAGE_SIZE));
    expect(seasonsPageCount(NOW)).toBe(7);
  });

  it("suit le passage d'une année", () => {
    expect(seasonsPageCount(new Date("2027-01-01T00:00:00Z"))).toBe(7);
    // 2033 fera 84 saisons, soit exactement 7 pages ; 2034 en ouvre une 8e.
    expect(seasonsPageCount(new Date("2033-06-01T00:00:00Z"))).toBe(7);
    expect(seasonsPageCount(new Date("2034-06-01T00:00:00Z"))).toBe(8);
  });
});

describe("parseSeasonsPage", () => {
  it("sans paramètre, c'est la première page", () => {
    expect(parseSeasonsPage(null, NOW)).toBe(1);
  });

  it("accepte les pages existantes", () => {
    expect(parseSeasonsPage("1", NOW)).toBe(1);
    expect(parseSeasonsPage("7", NOW)).toBe(7);
  });

  it("refuse une page hors de l'archive", () => {
    // Sans ce garde-fou, on partait chercher des années antérieures à 1950.
    expect(parseSeasonsPage("0", NOW)).toBeNull();
    expect(parseSeasonsPage("8", NOW)).toBeNull();
    expect(parseSeasonsPage("-1", NOW)).toBeNull();
  });

  it("refuse ce qui n'est pas un entier écrit en chiffres", () => {
    // `Number("")` vaut 0, `Number(" 2 ")` vaut 2 et `Number("2.5")` vaut 2.5 :
    // s'en remettre à `Number` seul laisserait passer les trois.
    for (const entree of ["", " ", " 2 ", "2.5", "abc", "1e2", "٣"]) {
      expect(parseSeasonsPage(entree, NOW), `« ${entree} »`).toBeNull();
    }
  });
});

describe("seasonsCacheControl", () => {
  it("cache brièvement la page qui contient la saison en cours", () => {
    expect(seasonsCacheControl(1)).toContain("s-maxage=60");
  });

  it("cache longuement les pages de saisons closes", () => {
    // À partir de la page 2, plus aucune de ces saisons ne changera.
    expect(seasonsCacheControl(2)).toContain("s-maxage=3600");
    expect(seasonsCacheControl(7)).toContain("s-maxage=3600");
  });

  it("autorise le cache partagé et la revalidation en arrière-plan", () => {
    for (const page of [1, 3]) {
      expect(seasonsCacheControl(page)).toContain("public");
      expect(seasonsCacheControl(page)).toContain("stale-while-revalidate");
    }
  });
});
