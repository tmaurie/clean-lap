import { describe, expect, it } from "vitest";

import {
  getConstructorColor,
  getConstructorLabel,
  getReadableConstructorColor,
} from "./colors";

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

describe("getReadableConstructorColor", () => {
  const luminance = (hex: string) => {
    const v = hex.replace("#", "");
    const channels = [0, 2, 4].map(
      (i) => parseInt(v.slice(i, i + 2), 16) / 255,
    );
    const f = (c: number) =>
      c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    return (
      0.2126 * f(channels[0]) +
      0.7152 * f(channels[1]) +
      0.0722 * f(channels[2])
    );
  };
  const contrastSurFondSombre = (hex: string) => {
    const a = luminance(hex);
    const b = luminance("#0b0d10");
    const [hi, lo] = a > b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
  };

  it("éclaircit une couleur trop sombre pour du texte", () => {
    // RB officiel : #3d3d3d, soit 1,3:1 sur le fond de l'app.
    expect(contrastSurFondSombre(getConstructorColor("rb"))).toBeLessThan(3);
    expect(
      contrastSurFondSombre(getReadableConstructorColor("rb")),
    ).toBeGreaterThanOrEqual(3);
  });

  it("laisse intactes les couleurs déjà lisibles", () => {
    // Ferrari est à plus de 3:1 : aucune raison de la toucher.
    expect(getReadableConstructorColor("ferrari")).toBe(
      getConstructorColor("ferrari"),
    );
  });

  it("garantit le seuil pour toutes les écuries connues", () => {
    const equipes = [
      "ferrari",
      "mercedes",
      "red_bull",
      "mclaren",
      "alpine",
      "aston_martin",
      "haas",
      "williams",
      "alphatauri",
      "rb",
      "sauber",
    ];

    for (const equipe of equipes) {
      const ratio = contrastSurFondSombre(getReadableConstructorColor(equipe));
      expect(ratio, `contraste de ${equipe}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("respecte un seuil plus exigeant si on le demande", () => {
    expect(
      contrastSurFondSombre(getReadableConstructorColor("rb", 4.5)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("retombe sur la couleur de texte par défaut sans écurie", () => {
    expect(getReadableConstructorColor("")).toBe("var(--foreground)");
  });
});
