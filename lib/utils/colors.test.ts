import { describe, expect, it } from "vitest";

import { getConstructorColor, getConstructorLabel } from "./colors";

describe("getConstructorColor", () => {
  it("reconnaît une écurie par son nom complet comme par son identifiant", () => {
    expect(getConstructorColor("Scuderia Ferrari")).toBe("#ff2c2c");
    expect(getConstructorColor("ferrari")).toBe("#ff2c2c");
    expect(getConstructorColor("  Scuderia Ferrari  ")).toBe("#ff2c2c");
  });

  it("donne une couleur stable aux écuries historiques inconnues", () => {
    // L'app remonte jusqu'en 1950 : la table de marques ne peut pas être
    // exhaustive, mais la couleur ne doit pas changer d'un rendu à l'autre.
    const first = getConstructorColor("Vanwall");
    expect(first).toMatch(/^hsl\(\d{1,3}, 60%, 55%\)$/);
    expect(getConstructorColor("Vanwall")).toBe(first);
  });

  it("distingue deux écuries inconnues différentes", () => {
    expect(getConstructorColor("Vanwall")).not.toBe(
      getConstructorColor("Brabham"),
    );
  });

  it("retombe sur un gris neutre sans écurie", () => {
    expect(getConstructorColor("")).toBe("#999");
  });
});

describe("getConstructorLabel", () => {
  it("traduit un identifiant en nom lisible", () => {
    expect(getConstructorLabel("red_bull")).toBe("Red Bull Racing");
    expect(getConstructorLabel("aston_martin")).toBe("Aston Martin");
  });

  it("laisse un nom complet inchangé", () => {
    expect(getConstructorLabel("Scuderia Ferrari")).toBe("Scuderia Ferrari");
  });

  it("humanise un identifiant inconnu", () => {
    expect(getConstructorLabel("team_lotus")).toBe("Team Lotus");
    expect(getConstructorLabel("brm")).toBe("Brm");
  });

  it("renvoie une chaîne vide sans écurie", () => {
    expect(getConstructorLabel("")).toBe("");
  });
});
