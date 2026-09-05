import { describe, expect, it } from "vitest";

import { countryToFlagEmoji } from "./flags";

describe("countryToFlagEmoji", () => {
  it("accepte un pays comme une nationalité", () => {
    // L'API mélange les deux selon l'endpoint (country vs nationality).
    expect(countryToFlagEmoji("France")).toBe("🇫🇷");
    expect(countryToFlagEmoji("French")).toBe("🇫🇷");
    expect(countryToFlagEmoji("Netherlands")).toBe("🇳🇱");
  });

  it("ignore la casse et les espaces", () => {
    expect(countryToFlagEmoji("  ITALY  ")).toBe("🇮🇹");
  });

  it("renvoie une chaîne vide sur une valeur inconnue ou absente", () => {
    expect(countryToFlagEmoji("Atlantide")).toBe("");
    expect(countryToFlagEmoji("")).toBe("");
  });
});
