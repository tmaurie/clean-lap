"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { nationalityToFlagEmoji } from "@/lib/utils/flags";
import {
  useConstructorStandings,
  useDriverStandings,
} from "@/features/standings/hooks";
import { getConstructorColor } from "@/components/ui/colors";

export function StandingsTabs({ season }: { season: string }) {
  const { data: drivers, isLoading: loadingDrivers } =
    useDriverStandings(season);
  const { data: constructors, isLoading: loadingConstructors } =
    useConstructorStandings(season);

  return (
    <Tabs defaultValue="drivers" className="space-y-4 w-full">
      <TabsList className="grid  grid-cols-2">
        <TabsTrigger value="drivers">Pilotes</TabsTrigger>
        <TabsTrigger value="constructors">Écuries</TabsTrigger>
      </TabsList>

      <TabsContent value="drivers">
        <ul className="space-y-2">
          {loadingDrivers ? (
            <p>Chargement...</p>
          ) : (
            drivers?.map((d) => (
              <li
                key={d.position}
                className="flex justify-between items-center px-4 py-2 border rounded-md"
              >
                <div>
                  <p className="font-semibold">
                    {d.position}. {nationalityToFlagEmoji(d.nationality)}{" "}
                    {d.driver}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getConstructorColor(d.constructor),
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      {d.constructor}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-right">{d.points} pts</span>
              </li>
            ))
          )}
        </ul>
      </TabsContent>

      <TabsContent value="constructors">
        <ul className="space-y-2">
          {loadingConstructors ? (
            <p>Chargement...</p>
          ) : (
            constructors?.map((c) => (
              <li
                key={c.position}
                className="flex justify-between items-center px-4 py-2 border rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getConstructorColor(c.constructor),
                    }}
                  />
                  <p className="font-semibold">
                    {c.position}. {c.constructor}
                  </p>
                </div>
                <span className="font-bold">{c.points} pts</span>
              </li>
            ))
          )}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
