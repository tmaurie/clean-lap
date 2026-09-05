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

const LABELS = ["Jours", "Heures", "Minutes", "Secondes"] as const;

export function HeroCountdown({ targetIso }: { targetIso: string }) {
  // Le rendu serveur est mis en cache (revalidate = 60) : calculer le restant
  // dès l'initialisation produisait un HTML serveur systématiquement différent
  // du premier rendu client, donc une erreur d'hydratation. On part d'un état
  // neutre et on démarre le décompte une fois monté.
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(true);
    setRemaining(getRemaining(targetIso));

    const interval = setInterval(() => {
      setRemaining(getRemaining(targetIso));
    }, 1000);

    return () => clearInterval(interval);
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
          key={label}
          className={
            "flex flex-col gap-1 px-6 py-5 sm:px-10" +
            (index < LABELS.length - 1 ? " border-r border-border" : "")
          }
        >
          <span
            className={
              "font-mono text-3xl font-extrabold leading-none tabular-nums sm:text-[2.75rem]" +
              (index === LABELS.length - 1 ? " text-primary" : "")
            }
          >
            {values ? pad(values[index]) : "--"}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
