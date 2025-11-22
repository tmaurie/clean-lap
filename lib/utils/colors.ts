export function getConstructorColor(constructor: string): string {
  const colors: Record<string, string> = {
    "Scuderia Ferrari": "#ff2c2c",
    "Mercedes Formula 1 Team": "#00d2be",
    "Red Bull Racing": "#1e41ff",
    "McLaren Formula 1 Team": "#ff8700",
    "Alpine F1 Team": "#2293d1",
    "Aston Martin F1 Team": "#006f62",
    "Haas F1 Team": "#b6babd",
    "Williams Racing": "#005aff",
    AlphaTauri: "#2b4562",
    "RB F1 Team": "#3d3d3d",
    "Sauber F1 Team": "#4de841",
  };

  return colors[constructor] ?? "#999";
}
