"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";

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
  const isThisWeekend = remaining.total < 1000 * 60 * 60 * 24 * 3; // 3 jours

  if (remaining.total <= 0) {
    return (
      <div className="text-center text-sm text-destructive font-semibold mt-4">
        🏁 C’est l’heure de la course !{" "}
        <span className="text-green-500 animate-pulse ml-1">🔴 En direct</span>
      </div>
    );
  }

  return (
    <Card className="border-none bg-accent relative overflow-hidden">
      <div className="flex justify-around">
        <span>Compte à rebours avant la course</span>
        {isThisWeekend && <Badge variant="destructive">Ce week-end</Badge>}
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
      <span className="text-3xl font-bold tabular-nums">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
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
