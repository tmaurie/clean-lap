import { expect, it, vi } from "vitest";
import {
  fetchCircuit,
  fetchCircuitRace,
  fetchCircuitsForSeason,
} from "./circuits";
import {
  envelope,
  grandPrix,
  monza,
  raceTable,
  stubProvider,
} from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

const catalunya = {
  circuitId: "catalunya",
  circuitName: "Circuit de Barcelona-Catalunya",
  Location: { locality: "Barcelona", country: "Spain" },
};

it("préserve le lien montmelo et complète la fiche par F1DB", async () => {
  stubProvider({
    "circuits/catalunya": envelope("CircuitTable", "Circuits", [catalunya]),
    "2025/circuits": envelope("CircuitTable", "Circuits", [catalunya, monza]),
  });
  await expect(fetchCircuit("montmelo")).resolves.toMatchObject({
    id: "montmelo",
    city: "Barcelona",
    lengthMeters: 4657,
    corners: 14,
  });
  await expect(fetchCircuitsForSeason("2025")).resolves.toMatchObject([
    { id: "montmelo" },
    { id: "monza" },
  ]);
});

it("retrouve le vainqueur d'une manche archivée par date et circuit", async () => {
  stubProvider({ "2025": raceTable([grandPrix]) });
  await expect(fetchCircuitRace("monza", "2025")).resolves.toMatchObject({
    name: "Italian Grand Prix",
    date: "2025-09-07",
    winner: "Max Verstappen",
    winnerTeamId: "red_bull",
  });
});

it("préserve la distinction entre circuit absent et calendrier indisponible", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  stubProvider({
    "circuits/inconnu": envelope("CircuitTable", "Circuits", []),
    "2025": raceTable([grandPrix]),
    "2021": new Error("HTTP 503"),
  });
  await expect(fetchCircuit("inconnu")).resolves.toBeNull();
  await expect(fetchCircuitRace("montmelo", "2025")).resolves.toBeNull();
  await expect(fetchCircuitRace("monza", "2021")).resolves.toBeUndefined();
  vi.restoreAllMocks();
});
