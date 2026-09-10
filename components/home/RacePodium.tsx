import type { RaceResult } from "@/entities/race/model";
import { getConstructorColor } from "@/lib/utils/colors";

/** « Max Verstappen » → { prenom: "Max", nom: "Verstappen" } */
function separerNom(complet: string) {
  const parties = complet.trim().split(" ");
  return {
    prenom: parties.slice(0, -1).join(" "),
    nom: parties.at(-1) ?? complet,
  };
}

/** Hauteur de marche : la première est la plus haute. */
const MARCHES = ["pt-10 sm:pt-14", "pt-5 sm:pt-8", "pt-2 sm:pt-3"];

/**
 * Podium du dernier Grand Prix. La home listait le top 6 à plat, sans rien
 * distinguer le vainqueur des autres.
 *
 * L'ordre du DOM reste 1, 2, 3 — c'est celui que lit un lecteur d'écran et
 * celui du `<ol>` ; seul l'affichage remonte le vainqueur au centre, via
 * `order`. Rien n'est focusable ici, il n'y a donc pas d'écart entre l'ordre
 * visuel et l'ordre de tabulation.
 */
export function RacePodium({ results }: { results: RaceResult[] }) {
  if (results.length === 0) {
    return (
      <p className="py-4 text-sm text-foreground/55">
        Résultats non disponibles.
      </p>
    );
  }

  const podium = results.slice(0, 3);
  const suivants = results.slice(3, 6);

  return (
    <div className="flex flex-col gap-6">
      <ol className="cl-stagger grid grid-cols-3 items-end gap-px border border-white/8 bg-white/8">
        {podium.map((r, i) => {
          const { prenom, nom } = separerNom(r.driver);
          const couleur = getConstructorColor(r.constructor);
          const premier = i === 0;

          return (
            <li
              key={r.position}
              className={[
                "relative flex flex-col gap-1.5 bg-background px-2 pb-4 sm:px-4 sm:pb-5",
                MARCHES[i],
                // Ordre visuel 2 · 1 · 3, sans toucher à l'ordre du DOM.
                premier ? "order-2" : i === 1 ? "order-1" : "order-3",
              ].join(" ")}
            >
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                aria-hidden
                style={{ background: couleur }}
              />
              <span
                className="text-2xl font-black italic leading-none sm:text-3xl"
                style={{
                  color: premier ? "var(--primary)" : "rgba(244,244,242,0.4)",
                }}
              >
                P{r.position}
              </span>
              {prenom && (
                <span className="truncate text-[11px] font-medium text-foreground/55 sm:text-xs">
                  {prenom}
                </span>
              )}
              <span className="text-[13px] font-extrabold uppercase leading-tight tracking-wide sm:text-base">
                {nom}
              </span>
              <span className="truncate text-[10px] text-foreground/55 sm:text-xs">
                {r.constructor}
              </span>
              <span className="mt-1 font-mono text-[11px] text-foreground/70 sm:text-xs">
                {r.points} pts
              </span>
              {r.time && (
                // Temps total pour le vainqueur, écart pour les deux autres.
                <span className="truncate font-mono text-[10px] text-foreground/55 sm:text-[11px]">
                  {r.time}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {suivants.length > 0 && (
        <ol className="cl-stagger flex flex-col">
          {suivants.map((r) => (
            <li
              key={r.position}
              className="flex items-center gap-3 border-b border-border py-2.5 sm:gap-5"
            >
              <span className="w-7 shrink-0 text-base font-black italic text-foreground/55">
                {r.position}
              </span>
              <span
                className="h-6 w-1 shrink-0"
                aria-hidden
                style={{ background: getConstructorColor(r.constructor) }}
              />
              <div className="flex w-0 min-w-0 flex-1 flex-col">
                <span className="text-[14px] font-bold uppercase tracking-wide">
                  {r.driver}
                </span>
                <span className="truncate text-xs text-foreground/55">
                  {r.constructor}
                </span>
              </div>
              <span className="w-14 shrink-0 text-right text-[14px] font-extrabold">
                {r.points}{" "}
                <span className="text-[11px] font-semibold text-foreground/55">
                  PTS
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
