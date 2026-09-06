"use client";

import { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(targetIso: string): Remaining | null {
  const total = new Date(targetIso).getTime() - Date.now();
  if (total <= 0) return null;
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Sur mobile, ce sont les libellés — pas les chiffres — qui font déborder le
 * bloc : « Secondes » est plus large que « 59 ». D'où une version courte en
 * dessous de `sm`, en CSS pur pour ne pas réintroduire d'écart serveur/client.
 */
const LABELS = [
  { long: "Jours", short: "J" },
  { long: "Heures", short: "H" },
  { long: "Minutes", short: "Min" },
  { long: "Secondes", short: "Sec" },
] as const;

export function HeroCountdown({ targetIso }: { targetIso: string }) {
  // Le rendu serveur est mis en cache (revalidate = 60) : calculer le restant
  // dès l'initialisation produisait un HTML serveur systématiquement différent
  // du premier rendu client, donc une erreur d'hydratation. On part d'un état
  // neutre et on démarre le décompte une fois monté.
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(true);

    // Un onglet en arrière-plan n'a aucune raison de recalculer un décompte
    // chaque seconde : on suspend l'intervalle quand la page est masquée et on
    // remet la valeur à jour dès qu'elle redevient visible.
    let interval: ReturnType<typeof setInterval> | undefined;

    const tick = () => setRemaining(getRemaining(targetIso));

    const resume = () => {
      tick();
      interval ??= setInterval(tick, 1000);
    };

    const suspend = () => {
      if (interval === undefined) return;
      clearInterval(interval);
      interval = undefined;
    };

    const handleVisibility = () => (document.hidden ? suspend() : resume());

    // Premier affichage même si l'onglet démarre masqué.
    tick();
    if (!document.hidden) resume();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      suspend();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [targetIso]);

  if (started && !remaining) {
    return (
      <div className="flex w-fit items-center gap-2 border border-primary/40 bg-primary/10 px-6 py-5 font-mono text-sm font-semibold uppercase tracking-wide text-primary">
        🏁 C&apos;est l&apos;heure de la course !
      </div>
    );
  }

  const values = remaining
    ? [remaining.days, remaining.hours, remaining.minutes, remaining.seconds]
    : null;

  return (
    <div
      className="flex w-fit border border-border bg-background/60"
      aria-label="Temps restant avant le départ"
    >
      {LABELS.map((label, index) => (
        <div
          key={label.long}
          className={
            "flex flex-col gap-1 px-4 py-4 sm:px-10 sm:py-5" +
            (index < LABELS.length - 1 ? " border-r border-border" : "")
          }
        >
          <span
            className={
              "font-mono text-2xl font-extrabold leading-none tabular-nums sm:text-[2.75rem]" +
              (index === LABELS.length - 1 ? " text-primary" : "")
            }
          >
            {values ? pad(values[index]) : "--"}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50 sm:tracking-[0.18em]">
            <span className="sm:hidden">{label.short}</span>
            <span className="hidden sm:inline">{label.long}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
