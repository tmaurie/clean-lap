"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  useDriverStandings,
  useConstructorStandings,
} from "@/features/standings/hooks";
import { getConstructorColor } from "@/components/ui/colors";

export function StandingsPreview() {
  const { data: drivers, isLoading: loadingDrivers } = useDriverStandings();
  const { data: constructors, isLoading: loadingConstructors } =
    useConstructorStandings();

  if (loadingDrivers || loadingConstructors)
    return <p>Chargement des classements...</p>;

  return (
    <Card className="h-auto">
      <CardHeader>
        <CardTitle>📊 Classements provisoires</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-semibold mb-2">🏎️ Pilotes</p>
          {drivers?.slice(0, 10).map((d, i) => (
            <div key={i} className="flex justify-between items-center mb-1">
              <div className="flex gap-2 items-center">
                <span className="w-5">{d.position}.</span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getConstructorColor(d.constructor),
                  }}
                />
                <span>{d.driver}</span>
              </div>
              <span className="text-muted-foreground">{d.points} pts</span>
            </div>
          ))}
        </div>

        <div>
          <p className="font-semibold mb-2">🏢 Écuries</p>
          {constructors?.map((c, i) => (
            <div key={i} className="flex justify-between items-center mb-1">
              <div className="flex gap-2 items-center">
                <span className="w-5">{c.position}.</span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getConstructorColor(c.constructor),
                  }}
                />
                <span>{c.constructor}</span>
              </div>
              <span className="text-muted-foreground">{c.points} pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
