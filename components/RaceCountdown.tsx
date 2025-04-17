"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (remaining.total <= 0) {
    return (
      <Card className="bg-destructive text-destructive-foreground">
        <CardHeader>
          <CardTitle>🏁 C’est l’heure de la course !</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>⏳ Décompte jusqu'à la course</CardTitle>
      </CardHeader>
      <CardContent>
        <p>La course commence dans :</p>
        <p className="text-3xl font-mono mt-2">
          {remaining.days}j {remaining.hours}h {remaining.minutes}m{" "}
          {remaining.seconds}s
        </p>
      </CardContent>
    </Card>
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
