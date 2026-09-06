const TEAM_COLORS_BY_NAME: Record<string, string> = {
  "Scuderia Ferrari": "#ff2c2c",
  Ferrari: "#ff2c2c",
  "Mercedes Formula 1 Team": "#00d2be",
  Mercedes: "#00d2be",
  "Red Bull Racing": "#1e41ff",
  "McLaren Formula 1 Team": "#ff8700",
  McLaren: "#ff8700",
  "Alpine F1 Team": "#2293d1",
  Alpine: "#2293d1",
  "Aston Martin F1 Team": "#006f62",
  "Aston Martin": "#006f62",
  "Haas F1 Team": "#b6babd",
  Haas: "#b6babd",
  "Williams Racing": "#005aff",
  Williams: "#005aff",
  AlphaTauri: "#2b4562",
  "RB F1 Team": "#3d3d3d",
  "Sauber F1 Team": "#4de841",
  Sauber: "#4de841",
};

const TEAM_COLORS_BY_ID: Record<string, string> = {
  ferrari: TEAM_COLORS_BY_NAME["Scuderia Ferrari"],
  mercedes: TEAM_COLORS_BY_NAME["Mercedes Formula 1 Team"],
  red_bull: TEAM_COLORS_BY_NAME["Red Bull Racing"],
  mclaren: TEAM_COLORS_BY_NAME["McLaren Formula 1 Team"],
  alpine: TEAM_COLORS_BY_NAME["Alpine F1 Team"],
  aston_martin: TEAM_COLORS_BY_NAME["Aston Martin F1 Team"],
  haas: TEAM_COLORS_BY_NAME["Haas F1 Team"],
  williams: TEAM_COLORS_BY_NAME["Williams Racing"],
  alphatauri: TEAM_COLORS_BY_NAME["AlphaTauri"],
  rb: TEAM_COLORS_BY_NAME["RB F1 Team"],
  sauber: TEAM_COLORS_BY_NAME["Sauber F1 Team"],
};

const TEAM_NAMES_BY_ID: Record<string, string> = {
  ferrari: "Ferrari",
  mercedes: "Mercedes",
  red_bull: "Red Bull Racing",
  mclaren: "McLaren",
  alpine: "Alpine",
  aston_martin: "Aston Martin",
  haas: "Haas",
  williams: "Williams",
  alphatauri: "AlphaTauri",
  rb: "RB F1 Team",
  sauber: "Sauber",
};

/**
 * Deterministic fallback color for constructors we don't have an official
 * brand color for (mostly historical teams, since the app lets you browse
 * seasons back to 1950). Keeps distinct teams visually distinguishable
 * instead of collapsing them all onto the same grey.
 */
function hashColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

function humanizeId(id: string): string {
  return id
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getConstructorColor(constructorOrId: string): string {
  if (!constructorOrId) return "#999";
  const key = constructorOrId.trim();
  if (TEAM_COLORS_BY_ID[key]) return TEAM_COLORS_BY_ID[key];
  if (TEAM_COLORS_BY_NAME[key]) return TEAM_COLORS_BY_NAME[key];
  return hashColor(key);
}

/** Human-readable constructor name, given either a full name or a team id/slug. */
export function getConstructorLabel(constructorOrId: string): string {
  if (!constructorOrId) return "";
  const key = constructorOrId.trim();
  if (TEAM_NAMES_BY_ID[key]) return TEAM_NAMES_BY_ID[key];
  if (TEAM_COLORS_BY_NAME[key]) return key;
  return humanizeId(key);
}

/* -------------------------------------------------------------------------
   Lisibilité des couleurs d'écurie utilisées comme couleur de texte
   ------------------------------------------------------------------------- */

const DARK_BACKGROUND = [0x0b, 0x0d, 0x10] as const;

function parseHex(color: string): [number, number, number] | null {
  const match = /^#?([\da-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: readonly [number, number, number]) {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastWithBackground(rgb: readonly [number, number, number]) {
  const a = relativeLuminance(rgb);
  const b = relativeLuminance(DARK_BACKGROUND);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Version lisible d'une couleur d'écurie, pour les cas où elle sert de
 * **couleur de texte** sur le fond sombre de l'app.
 *
 * Certaines couleurs officielles sont trop sombres pour ça : RB (#3d3d3d)
 * plafonnait à 1,3:1, très en dessous du minimum de 3:1. On éclaircit vers le
 * blanc, par pas de 5 %, jusqu'à franchir le seuil — la teinte de marque est
 * conservée, seule la luminosité bouge.
 *
 * À n'utiliser que pour du texte : en aplat ou en filet (`background`), la
 * couleur officielle reste la bonne.
 */
export function getReadableConstructorColor(
  constructorOrId: string,
  minimumRatio = 3,
): string {
  const base = parseHex(getConstructorColor(constructorOrId));
  if (!base) return "var(--foreground)";

  let rgb: [number, number, number] = [...base];
  for (let step = 0; step < 20; step++) {
    if (contrastWithBackground(rgb) >= minimumRatio) break;
    rgb = [
      Math.round(rgb[0] + (255 - rgb[0]) * 0.05),
      Math.round(rgb[1] + (255 - rgb[1]) * 0.05),
      Math.round(rgb[2] + (255 - rgb[2]) * 0.05),
    ];
  }

  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
