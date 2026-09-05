import { afterEach, describe, expect, it, vi } from "vitest";

import constructorFixture from "@/docs/api/constructor_championship.json";
import driverFixture from "@/docs/api/driver_championship.json";

import { fetchConstructorStandings, fetchDriverStandings } from "./standings";

function stubFetch(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      json: async () => body,
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchDriverStandings", () => {
  it("mappe le classement pilotes", async () => {
    stubFetch(driverFixture);

    const standings = await fetchDriverStandings("2024");

    expect(standings).toHaveLength(21);
    expect(standings[0]).toEqual({
      position: "1",
      wins: 10,
      points: "395.5",
      driver: "Max Verstappen",
      constructor: "Red Bull Racing",
      nationality: "Netherlands",
    });
  });

  it("comble les champs manquants au lieu de propager undefined", async () => {
    stubFetch({
      drivers_championship: [{ driver: { name: "Sans" }, team: null }],
    });

    const [entry] = await fetchDriverStandings("1950");

    expect(entry).toEqual({
      position: "-",
      wins: 0,
      points: "0",
      driver: "Sans",
      constructor: "N/A",
      nationality: "N/A",
    });
  });

  it("renvoie une liste vide si l'API ne fournit pas de classement", async () => {
    stubFetch({});
    await expect(fetchDriverStandings("2024")).resolves.toEqual([]);
  });

  it("lève quand la requête échoue", async () => {
    stubFetch(null, 500);
    await expect(fetchDriverStandings("2024")).rejects.toThrow(
      /driver standings/,
    );
  });
});

describe("fetchConstructorStandings", () => {
  it("mappe le classement constructeurs", async () => {
    stubFetch(constructorFixture);

    const standings = await fetchConstructorStandings("2024");

    expect(standings).toHaveLength(10);
    expect(standings[0]).toEqual({
      position: "1",
      points: "613.5",
      wins: 9,
      constructor: "Mercedes Formula 1 Team",
      nationality: "Germany",
    });
  });

  it("lève quand la requête échoue", async () => {
    stubFetch(null, 404);
    await expect(fetchConstructorStandings("2024")).rejects.toThrow(
      /constructor standings/,
    );
  });
});
