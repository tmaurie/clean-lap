"use client";

import {
  useConstructorStandings,
  useDriverStandings,
} from "@/features/standings/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StandingsTabs } from "@/components/standings/StandingsTabs";

export function StandingsPreview() {
  const {isLoading: loadingDrivers } =
    useDriverStandings("current");
  const {isLoading: loadingConstructors } =
    useConstructorStandings("current");

  if (loadingDrivers || loadingConstructors)
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <StandingsTabs season="current" compact />

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm">
          <Link href="/standings">Voir le classement complet</Link>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
