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
