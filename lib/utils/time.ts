/**
 * Parsing des temps de piste renvoyés par f1api.dev.
 *
 * L'API n'est pas homogène : les qualifs séparent les millièmes par un
 * deux-points ("1:29:909" = 1 min 29 s 909), les essais libres et le meilleur
 * tour en course par un point ("1:13.040"), et le temps total du vainqueur
 * ajoute les heures ("1:32:01.596"). Les écarts sont préfixés ("+10.388").
 *
 * L'ancienne approche (`Number(t.replace(/[:.]/g, ""))`) ne comparait
 * correctement que des chaînes de longueur identique : "1:13.04" devenait
 * 11304 et passait devant tout le monde. On convertit donc en millisecondes.
 */
export function parseLapTimeMs(value?: string | null): number | null {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim().replace(/^\+/, "");
  if (raw === "") return null;

  let head = raw;
  let fraction = "";

  const decimal = raw.match(/^(.*)[.,](\d{1,3})$/);
  if (decimal) {
    head = decimal[1];
    fraction = decimal[2];
  } else {
    // Pas de séparateur décimal : le dernier segment est en millièmes s'il
    // fait exactement 3 chiffres ("1:29:909"), sinon c'est une seconde.
    const segments = raw.split(":");
    if (segments.length > 1 && segments[segments.length - 1].length === 3) {
      fraction = segments.pop() as string;
      head = segments.join(":");
    }
  }

  const segments = head.split(":");
  if (segments.length > 3 || segments.some((s) => !/^\d+$/.test(s))) {
    return null;
  }

  const seconds = segments
    .map(Number)
    .reduce((total, segment) => total * 60 + segment, 0);

  return seconds * 1000 + Number(fraction.padEnd(3, "0") || 0);
}

/** Temps le plus rapide d'une liste, en millisecondes. `null` si aucun. */
export function fastestLapTimeMs(
  values: (string | null | undefined)[],
): number | null {
  return values.reduce<number | null>((best, value) => {
    const ms = parseLapTimeMs(value);
    if (ms === null) return best;
    return best === null || ms < best ? ms : best;
  }, null);
}

/** `true` si `value` est (à l'exactitude du parsing près) le temps de référence. */
export function isFastestTime(
  value: string | null | undefined,
  best: number | null,
): boolean {
  if (best === null) return false;
  const ms = parseLapTimeMs(value);
  return ms !== null && ms === best;
}
