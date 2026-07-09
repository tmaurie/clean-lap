"use client";

import { useEffect, useState } from "react";

function getRemaining(targetIso: string) {
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

export function HeroCountdown({ targetIso }: { targetIso: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetIso));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining(targetIso));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!remaining) {
    return (
      <div className="flex w-fit items-center gap-2 border border-primary/40 bg-primary/10 px-6 py-5 font-mono text-sm font-semibold uppercase tracking-wide text-primary">
        🏁 C&apos;est l&apos;heure de la course !
      </div>
    );
  }

  const items = [
    { label: "Jours", value: pad(remaining.days) },
    { label: "Heures", value: pad(remaining.hours) },
    { label: "Minutes", value: pad(remaining.minutes) },
    { label: "Secondes", value: pad(remaining.seconds), accent: true },
  ];

  return (
    <div className="flex w-fit border border-border bg-background/60">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={
            "flex flex-col gap-1 px-6 py-5 sm:px-10" +
            (index < items.length - 1 ? " border-r border-border" : "")
          }
        >
          <span
            className={
              "font-mono text-3xl font-extrabold leading-none tabular-nums sm:text-[2.75rem]" +
              (item.accent ? " text-primary" : "")
            }
          >
            {item.value}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
