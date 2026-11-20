import { expect, it, vi } from "vitest";
import { fetchSeasonDetailsPage } from "./results";
import { stubProvider } from "./test-support";

vi.mock("./client", () => ({ requestData: vi.fn() }));

it("affiche la saison 1950 depuis l'export sans requête externe", async () => {
  const request = stubProvider({});
  const page = new Date().getFullYear() - 1950 + 1;
  await expect(fetchSeasonDetailsPage(page, 1)).resolves.toEqual([
    {
      season: "1950",
      raceCount: 7,
      driverChampion: { name: "Nino Farina", nationality: "Italian" },
    },
  ]);
  expect(request).not.toHaveBeenCalled();
});
