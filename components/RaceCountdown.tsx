"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {Card} from "@/components/ui/card";

type RaceCountdownProps = {
  date: string;
  time: string;
};

export function RaceCountdown({ date, time }: RaceCountdownProps) {
  const raceDate = useMemo(() => new Date(`${date}T${time}`), [date, time]);
  const [remaining, setRemaining] = useState(getTimeRemaining(raceDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(raceDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [raceDate]);

  const isImminent = remaining.total < 1000 * 60 * 60 * 24; // 24h

  if (remaining.total <= 0) {
    return (
      <div className="text-center text-sm text-destructive font-semibold mt-4">
        🏁 C’est l’heure de la course !{" "}
        <span className="text-green-500 animate-pulse ml-1">🔴 En direct</span>
      </div>
    );
  }

  return (
    <Card className="border-none bg-accent">
      <div className="flex justify-center">
        Compte à rebours avant la course
      </div>
      <div
        className={clsx(
          "grid grid-cols-4 gap-2 text-center mt-4",
          isImminent && "animate-pulse text-destructive",
        )}
      >
        <CountdownItem label="jours" value={remaining.days} />
        <CountdownItem label="h" value={remaining.hours} />
        <CountdownItem label="m" value={remaining.minutes} />
        <CountdownItem label="s" value={remaining.seconds} />
      </div>
    </Card>
  );
}

function CountdownItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function getTimeRemaining(raceDate: Date) {
  const now = new Date();
  const total = raceDate.getTime() - now.getTime();

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}
