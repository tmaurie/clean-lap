import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  REMINDER_MINUTES,
  readReminder,
  reminderMessage,
  reminderState,
  writeReminder,
} from "./raceReminder";

const DEPART = new Date("2026-09-13T13:00:00Z");

describe("reminderState", () => {
  it("attend tant que le départ est à plus d'une heure", () => {
    expect(reminderState(new Date("2026-09-13T11:59:00Z"), DEPART)).toBe(
      "trop-tot",
    );
  });

  it("déclenche pile à une heure du départ", () => {
    expect(reminderState(new Date("2026-09-13T12:00:00Z"), DEPART)).toBe(
      "a-declencher",
    );
  });

  it("reste déclenchable pendant toute l'heure qui précède", () => {
    // La fenêtre dure une heure pleine : un onglet en arrière-plan ne tique
    // qu'environ une fois par minute, viser un instant précis raterait tout.
    for (const minute of [1, 15, 30, 59]) {
      const now = new Date(DEPART.getTime() - (60 - minute) * 60_000);
      expect(reminderState(now, DEPART), `à T-${60 - minute} min`).toBe(
        "a-declencher",
      );
    }
  });

  it("ne déclenche plus une fois la course partie", () => {
    expect(reminderState(DEPART, DEPART)).toBe("depasse");
    expect(reminderState(new Date("2026-09-13T14:00:00Z"), DEPART)).toBe(
      "depasse",
    );
  });

  it("accepte un autre délai", () => {
    expect(reminderState(new Date("2026-09-13T12:45:00Z"), DEPART, 30)).toBe(
      "a-declencher",
    );
    expect(reminderState(new Date("2026-09-13T12:15:00Z"), DEPART, 30)).toBe(
      "trop-tot",
    );
  });

  it("vise bien une heure par défaut", () => {
    expect(REMINDER_MINUTES).toBe(60);
  });
});

describe("reminderMessage", () => {
  it("nomme la course", () => {
    const { title, body } = reminderMessage("Grand Prix d'Italie");

    expect(title).toBeTruthy();
    expect(body).toContain("Grand Prix d'Italie");
  });
});

describe("persistance", () => {
  function installWindow(overrides: Partial<Storage> = {}) {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        removeItem: (k: string) => void store.delete(k),
        ...overrides,
      } as Storage,
    });
    return store;
  }

  beforeEach(() => installWindow());
  afterEach(() => vi.unstubAllGlobals());

  it("part désactivé", () => {
    expect(readReminder()).toEqual({ enabled: false, lastFired: null });
  });

  it("relit ce qu'il a écrit", () => {
    writeReminder({ enabled: true, lastFired: "2026-14" });

    expect(readReminder()).toEqual({ enabled: true, lastFired: "2026-14" });
  });

  it("ignore un contenu corrompu", () => {
    const store = installWindow();
    store.set("cleanlap.reminder.v1", "{ pas du json");

    expect(readReminder()).toEqual({ enabled: false, lastFired: null });
  });

  it("ignore des champs du mauvais type", () => {
    const store = installWindow();
    store.set(
      "cleanlap.reminder.v1",
      JSON.stringify({ enabled: "oui", lastFired: 42 }),
    );

    expect(readReminder()).toEqual({ enabled: false, lastFired: null });
  });

  it("ne casse pas quand l'écriture est refusée", () => {
    installWindow({
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });

    expect(() =>
      writeReminder({ enabled: true, lastFired: null }),
    ).not.toThrow();
  });

  it("sans window, reste inerte", () => {
    vi.stubGlobal("window", undefined);

    expect(readReminder()).toEqual({ enabled: false, lastFired: null });
    expect(() =>
      writeReminder({ enabled: true, lastFired: null }),
    ).not.toThrow();
  });
});
