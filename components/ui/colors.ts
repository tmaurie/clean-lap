export function getConstructorColor(constructor: string): string {
  const colors: Record<string, string> = {
    Ferrari: "#ff2c2c",
    Mercedes: "#00d2be",
    "Red Bull": "#1e41ff",
    McLaren: "#ff8700",
    "Alpine F1 Team": "#2293d1",
    "Aston Martin": "#006f62",
    "Haas F1 Team": "#b6babd",
    Williams: "#005aff",
    AlphaTauri: "#2b4562",
    "RB F1 Team": "#3d3d3d",
    Sauber: "#a2a2a2",
  };

  return colors[constructor] ?? "#999";
}
