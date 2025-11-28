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

export function getConstructorColor(constructorOrId: string): string {
  if (!constructorOrId) return "#999";
  const key = constructorOrId.trim();
  if (TEAM_COLORS_BY_ID[key]) return TEAM_COLORS_BY_ID[key];
  return TEAM_COLORS_BY_NAME[key] ?? "#999";
}
