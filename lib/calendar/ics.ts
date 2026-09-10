export type CalendarEvent = {
  /** Identifiant stable : réimporter le fichier met l'événement à jour. */
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  location?: string;
  description?: string;
  url?: string;
  /**
   * Minutes de rappel avant le début. `null` quand l'heure n'est pas connue :
   * un rappel « une heure avant » n'a aucun sens sur un événement d'une
   * journée entière.
   */
  alarmMinutesBefore?: number | null;
  /** L'API ne donne pas toujours l'horaire : on retombe sur la journée. */
  allDay?: boolean;
};

const PRODID = "-//CleanLap//Calendrier F1//FR";

/** « 2026-09-13T13:00:00Z » → « 20260913T130000Z ». */
function toUtcStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** « 2026-09-13T13:00:00Z » → « 20260913 », pour un événement d'une journée. */
function toDateStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Échappement des valeurs TEXT (RFC 5545 §3.3.11). Sans ça, un nom de circuit
 * comportant une virgule — « Monza, Italy » — coupe la propriété en deux et
 * l'agenda importe un événement tronqué.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Pliage des lignes à 75 octets (RFC 5545 §3.1), avec une espace en tête de
 * continuation. Le découpage se fait sur les octets **sans couper un point de
 * code** : « Grand Prix d'Autriche » compte ses accents pour deux octets, et
 * un caractère coupé en deux rend le fichier illisible.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const morceaux: string[] = [];
  let courant = "";
  let octets = 0;
  let limite = 75;

  for (const caractere of line) {
    const taille = encoder.encode(caractere).length;
    if (octets + taille > limite) {
      morceaux.push(courant);
      courant = "";
      octets = 0;
      // Les lignes suivantes commencent par une espace, qui compte.
      limite = 74;
    }
    courant += caractere;
    octets += taille;
  }
  morceaux.push(courant);

  return morceaux.join("\r\n ");
}

function propriete(nom: string, valeur: string): string {
  return foldLine(`${nom}:${valeur}`);
}

export function buildIcs(
  events: CalendarEvent[],
  now: Date = new Date(),
): string {
  const lignes: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    lignes.push("BEGIN:VEVENT");
    lignes.push(propriete("UID", event.uid));
    lignes.push(propriete("DTSTAMP", toUtcStamp(now)));

    if (event.allDay) {
      lignes.push(`DTSTART;VALUE=DATE:${toDateStamp(event.start)}`);
      lignes.push(`DTEND;VALUE=DATE:${toDateStamp(event.end)}`);
    } else {
      lignes.push(propriete("DTSTART", toUtcStamp(event.start)));
      lignes.push(propriete("DTEND", toUtcStamp(event.end)));
    }

    lignes.push(propriete("SUMMARY", escapeText(event.summary)));
    if (event.location) {
      lignes.push(propriete("LOCATION", escapeText(event.location)));
    }
    if (event.description) {
      lignes.push(propriete("DESCRIPTION", escapeText(event.description)));
    }
    if (event.url) {
      lignes.push(propriete("URL", event.url));
    }

    const rappel = event.alarmMinutesBefore;
    if (!event.allDay && typeof rappel === "number" && rappel > 0) {
      lignes.push("BEGIN:VALARM");
      lignes.push(`TRIGGER:-PT${rappel}M`);
      lignes.push("ACTION:DISPLAY");
      lignes.push(propriete("DESCRIPTION", escapeText(event.summary)));
      lignes.push("END:VALARM");
    }

    lignes.push("END:VEVENT");
  }

  lignes.push("END:VCALENDAR");

  // CRLF obligatoire, y compris en fin de fichier.
  return `${lignes.join("\r\n")}\r\n`;
}
