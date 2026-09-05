import { describe, expect, it } from "vitest";

import { fastestLapTimeMs, isFastestTime, parseLapTimeMs } from "./time";

describe("parseLapTimeMs", () => {
  it("lit le format des qualifs, où les millièmes suivent un ':'", () => {
    // f1api.dev renvoie "1:29:909" pour 1 min 29 s 909.
    expect(parseLapTimeMs("1:29:909")).toBe(89909);
    expect(parseLapTimeMs("1:30:031")).toBe(90031);
  });

  it("lit le format course / essais libres, avec un point décimal", () => {
    expect(parseLapTimeMs("1:13.040")).toBe(73040);
    expect(parseLapTimeMs("1:17.252")).toBe(77252);
  });

  it("lit un temps total avec les heures", () => {
    expect(parseLapTimeMs("1:32:01.596")).toBe(5521596);
  });

  it("complète les millièmes tronqués au lieu de les concaténer", () => {
    // C'est précisément ce que l'ancienne implémentation cassait :
    // Number("1:13.04".replace(/[:.]/g, "")) valait 11304, donc "1:13.04"
    // passait pour plus rapide que n'importe quel autre tour.
    expect(parseLapTimeMs("1:13.04")).toBe(73040);
    expect(parseLapTimeMs("1:13.4")).toBe(73400);
  });

  it("gère les temps sous la minute", () => {
    expect(parseLapTimeMs("59.999")).toBe(59999);
    expect(parseLapTimeMs("0:59.500")).toBe(59500);
  });

  it("accepte un écart préfixé et la virgule décimale", () => {
    expect(parseLapTimeMs("+10.388")).toBe(10388);
    expect(parseLapTimeMs("1:13,040")).toBe(73040);
  });

  it("renvoie null pour tout ce qui n'est pas un temps", () => {
    expect(parseLapTimeMs("N/A")).toBeNull();
    expect(parseLapTimeMs("DNF")).toBeNull();
    expect(parseLapTimeMs("+1 lap")).toBeNull();
    expect(parseLapTimeMs("")).toBeNull();
    expect(parseLapTimeMs("   ")).toBeNull();
    expect(parseLapTimeMs(null)).toBeNull();
    expect(parseLapTimeMs(undefined)).toBeNull();
  });
});

describe("fastestLapTimeMs", () => {
  it("trouve le meilleur temps d'une liste", () => {
    expect(fastestLapTimeMs(["1:13.040", "1:12.447", "1:13.123"])).toBe(72447);
  });

  it("ordonne correctement des chaînes de longueurs différentes", () => {
    // Le tri par concaténation se trompait ici : 11304 < 112999.
    expect(fastestLapTimeMs(["1:13.04", "1:12.999"])).toBe(72999);
    expect(fastestLapTimeMs(["1:13.040", "59.500"])).toBe(59500);
  });

  it("ignore les valeurs non exploitables", () => {
    expect(fastestLapTimeMs([null, "N/A", undefined, "1:13.040"])).toBe(73040);
    expect(fastestLapTimeMs([])).toBeNull();
    expect(fastestLapTimeMs([null, "DNF"])).toBeNull();
  });
});

describe("isFastestTime", () => {
  it("compare deux écritures équivalentes du même temps", () => {
    expect(isFastestTime("1:29:909", 89909)).toBe(true);
    expect(isFastestTime("1:29.909", 89909)).toBe(true);
  });

  it("est faux sans référence ou sans temps", () => {
    expect(isFastestTime("1:29:909", null)).toBe(false);
    expect(isFastestTime(null, 89909)).toBe(false);
    expect(isFastestTime("N/A", 89909)).toBe(false);
  });
});
