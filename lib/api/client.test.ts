import { afterEach, expect, it, vi } from "vitest";
import { requestData } from "./client";

vi.mock("next/cache", () => ({
  unstable_cache: (callback: unknown) => callback,
}));

afterEach(() => vi.unstubAllGlobals());

it("déduplique les requêtes simultanées et identifie CleanLap auprès de Jolpica", async () => {
  const body = { MRData: {} };
  const fetch = vi.fn(async () => Response.json(body));
  vi.stubGlobal("fetch", fetch);
  const data = await Promise.all([
    requestData("jolpica", "2026/"),
    requestData("jolpica", "2026/"),
  ]);
  expect(data).toEqual([body, body]);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    "https://api.jolpi.ca/ergast/f1/2026/",
    expect.objectContaining({
      headers: expect.objectContaining({ "User-Agent": "CleanLap/0.1.0" }),
    }),
  );
});

it("lève sur un 429 afin que Next conserve la valeur précédente", async () => {
  const fetch = vi.fn(
    async () =>
      new Response(null, { status: 429, headers: { "Retry-After": "60" } }),
  );
  vi.stubGlobal("fetch", fetch);
  await expect(requestData("openf1", "sessions?year=2026")).rejects.toThrow(
    "429",
  );
  await expect(
    requestData("openf1", "drivers?session_key=9686"),
  ).rejects.toThrow("429");
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("restitue la dernière réponse valide après une revalidation en panne", async () => {
  const millis = Date.now();
  const date = vi.spyOn(Date, "now").mockReturnValue(millis + 1000);
  const body = { MRData: { total: "23" } };
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(body))
    .mockResolvedValueOnce(new Response(null, { status: 503 }));
  vi.stubGlobal("fetch", fetch);
  try {
    await expect(
      requestData("jolpica", "2026/races/", "current"),
    ).resolves.toEqual(body);
    date.mockReturnValue(millis + 61_000);
    await expect(
      requestData("jolpica", "2026/races/", "current"),
    ).resolves.toEqual(body);
    expect(fetch).toHaveBeenCalledTimes(2);
  } finally {
    date.mockRestore();
  }
});
