"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Driver } from "@/entities/driver/model";
import { countryToFlagEmoji } from "@/lib/utils/flags";

type DriverCardProps = {
  driver: Driver;
};

export function DriverCard({ driver }: DriverCardProps) {
  const flag = driver.nationality ? countryToFlagEmoji(driver.nationality) : "";

  return (
    <Card className="border-primary/10 bg-card/80 backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            #{driver.number ?? "??"}
          </Badge>
          {flag && <span className="text-lg">{flag}</span>}
        </div>
        <CardTitle className="text-lg leading-tight">
          {driver.name} {driver.surname}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide">Nation</div>
          <div>{driver.nationality ?? "N/A"}</div>
        </div>
        <Link
          href={`/drivers/${driver.id}`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Voir le profil <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
