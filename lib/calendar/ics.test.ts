import { describe, expect, it } from "vitest";

import { buildIcs, type CalendarEvent } from "./ics";

const NOW = new Date("2026-09-10T08:00:00Z");

const course: CalendarEvent = {
  uid: "cleanlap-2026-14-race@cleanlap.app",
  start: new Date("2026-09-13T13:00:00Z"),
  end: new Date("2026-09-13T15:30:00Z"),
  summary: "F1 — Grand Prix d'Italie",
  location: "Monza, Italy",
  description: "Manche 14 de la saison 2026",
  url: "https://cleanlap.vercel.app/results/2026/14",
  alarmMinutesBefore: 60,
};

/** Le format impose CRLF : on raisonne ligne par ligne, dépliées. */
function lignes(ics: string): string[] {
  return ics.replace(/\r\n /g, "").split("\r\n");
}

describe("buildIcs", () => {
  it("produit une enveloppe VCALENDAR valide", () => {
    const l = lignes(buildIcs([course], NOW));

    expect(l[0]).toBe("BEGIN:VCALENDAR");
    expect(l).toContain("VERSION:2.0");
    expect(l).toContain("CALSCALE:GREGORIAN");
    expect(l.at(-2)).toBe("END:VCALENDAR");
  });

  it("termine chaque ligne par CRLF, fin de fichier comprise", () => {
    const ics = buildIcs([course], NOW);

    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    // Aucun LF isolé : un agenda strict refuse le fichier.
    expect(/(?<!\r)\n/.test(ics)).toBe(false);
  });

  it("écrit les dates en UTC compact", () => {
    const l = lignes(buildIcs([course], NOW));

    expect(l).toContain("DTSTART:20260913T130000Z");
    expect(l).toContain("DTEND:20260913T153000Z");
    expect(l).toContain("DTSTAMP:20260910T080000Z");
  });

  it("pose le rappel avant le départ", () => {
    const l = lignes(buildIcs([course], NOW));

    expect(l).toContain("BEGIN:VALARM");
    expect(l).toContain("TRIGGER:-PT60M");
    expect(l).toContain("ACTION:DISPLAY");
  });

  it("échappe les virgules, points-virgules et antislashs", () => {
    // « Monza, Italy » non échappé coupe LOCATION en deux et l'agenda importe
    // un événement tronqué.
    const l = lignes(
      buildIcs(
        [{ ...course, location: "Monza, Italy; A\\B", summary: "A,B" }],
        NOW,
      ),
    );

    expect(l).toContain("LOCATION:Monza\\, Italy\\; A\\\\B");
    expect(l).toContain("SUMMARY:A\\,B");
  });

  it("échappe les retours à la ligne", () => {
    const l = lignes(
      buildIcs([{ ...course, description: "ligne 1\nligne 2" }], NOW),
    );

    expect(l).toContain("DESCRIPTION:ligne 1\\nligne 2");
  });

  it("plie les lignes de plus de 75 octets", () => {
    const ics = buildIcs(
      [{ ...course, summary: "Grand Prix ".repeat(12).trim() }],
      NOW,
    );

    const encoder = new TextEncoder();
    for (const ligne of ics.split("\r\n")) {
      expect(encoder.encode(ligne).length, ligne).toBeLessThanOrEqual(75);
    }
    // Et la continuation commence par une espace.
    expect(ics).toMatch(/\r\n /);
  });

  it("ne coupe pas un caractère accentué en deux", () => {
    // Les accents pèsent deux octets : plier sur une frontière d'octet
    // produirait un fichier illisible.
    const ics = buildIcs([{ ...course, summary: "é".repeat(80) }], NOW);

    const deplie = ics.replace(/\r\n /g, "");
    expect(deplie).toContain(`SUMMARY:${"é".repeat(80)}`);
  });

  it("retombe sur une journée entière quand l'heure est inconnue", () => {
    const l = lignes(
      buildIcs(
        [
          {
            ...course,
            allDay: true,
            start: new Date("2026-09-13T00:00:00Z"),
            end: new Date("2026-09-14T00:00:00Z"),
          },
        ],
        NOW,
      ),
    );

    expect(l).toContain("DTSTART;VALUE=DATE:20260913");
    expect(l).toContain("DTEND;VALUE=DATE:20260914");
    // Pas de rappel « une heure avant » sur un événement sans heure.
    expect(l).not.toContain("BEGIN:VALARM");
  });

  it("omet le rappel quand il n'est pas demandé", () => {
    const l = lignes(buildIcs([{ ...course, alarmMinutesBefore: null }], NOW));

    expect(l).not.toContain("BEGIN:VALARM");
  });

  it("écrit autant de VEVENT que d'événements", () => {
    const ics = buildIcs(
      [course, { ...course, uid: "autre@cleanlap.app" }],
      NOW,
    );

    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(2);
  });

  it("accepte une liste vide", () => {
    const l = lignes(buildIcs([], NOW));

    expect(l[0]).toBe("BEGIN:VCALENDAR");
    expect(l.at(-2)).toBe("END:VCALENDAR");
    expect(l).not.toContain("BEGIN:VEVENT");
  });
});
