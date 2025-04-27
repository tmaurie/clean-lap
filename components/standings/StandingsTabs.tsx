"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { nationalityToFlagEmoji } from "@/lib/utils/flags";
import {
  useConstructorStandings,
  useDriverStandings,
} from "@/features/standings/hooks";
import { getConstructorColor } from "@/components/ui/colors";
import { clsx } from "clsx";

export function StandingsTabs({
  season,
  compact = false,
}: {
  season: string;
  compact?: boolean;
}) {
  const { data: drivers, isLoading: loadingDrivers } =
    useDriverStandings(season);
  const { data: constructors, isLoading: loadingConstructors } =
    useConstructorStandings(season);

  const limit = compact ? 5 : undefined;

  return (
    <Tabs defaultValue="drivers" className="w-full">
      <TabsList
        className={clsx(compact && "justify-center", "grid grid-cols-2")}
      >
        <TabsTrigger value="drivers">Pilotes</TabsTrigger>
        <TabsTrigger value="constructors">Écuries</TabsTrigger>
      </TabsList>

      <TabsContent value="drivers">
        <ul className="space-y-2 ">
          {loadingDrivers ? (
            <p>Chargement...</p>
          ) : (
            drivers?.slice(0, limit).map((d) => (
              <li
                key={d.position}
                className={`flex justify-between items-center px-3 py-2 border relative overflow-hidden bg-accent  rounded-md ${compact ? "text-xs" : "text-sm"}`}
              >
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getConstructorColor(d.constructor),
                      }}
                    />
                    {d.position}. {d.driver}{" "}
                    {nationalityToFlagEmoji(d.nationality)}
                  </p>
                  {!compact && (
                    <p className="text-muted-foreground text-xs">
                      {d.constructor}
                    </p>
                  )}
                </div>
                <span className="font-bold">{d.points} pts</span>
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
            constructors?.slice(0, limit).map((c) => (
              <li
                key={c.position}
                className={`flex justify-between items-center px-3 py-2 border relative overflow-hidden bg-accent rounded-md ${compact ? "text-xs" : "text-sm"}`}
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
