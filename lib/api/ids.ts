const circuitAliases = {
  austin: "americas",
  gilles_villeneuve: "villeneuve",
  hermanos_rodriguez: "rodriguez",
  lusail: "losail",
  montmelo: "catalunya",
} as const;

const legacyCircuitIds = new Map(
  Object.entries(circuitAliases).map(([legacy, provider]) => [
    provider as string,
    legacy,
  ]),
);

export function jolpicaCircuitId(id: string): string {
  return Object.hasOwn(circuitAliases, id)
    ? circuitAliases[id as keyof typeof circuitAliases]
    : id;
}

export function cleanLapCircuitId(id: string): string {
  return legacyCircuitIds.get(id) ?? id;
}

export function cleanLapDriverId(id: string): string {
  return id === "zhou" ? "guanyu" : id;
}

export function jolpicaDriverId(id: string): string {
  return id === "guanyu" ? "zhou" : id;
}
