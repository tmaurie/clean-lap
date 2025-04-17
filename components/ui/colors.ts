export function getConstructorColor(constructor: string): string {
  const colors: Record<string, string> = {
    Ferrari: "#ff2c2c",
    Mercedes: "#00d2be",
    RedBull: "#1e41ff",
    McLaren: "#ff8700",
    Alpine: "#2293d1",
    AstonMartin: "#006f62",
    Haas: "#b6babd",
    Williams: "#005aff",
    AlphaTauri: "#2b4562",
    "RB F1 Team": "#3d3d3d",
  };

  return colors[constructor] ?? "#999";
}
