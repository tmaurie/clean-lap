"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Driver } from "@/entities/driver/model";
import { countryToFlagEmoji } from "@/lib/utils/flags";
import { getConstructorColor } from "@/lib/utils/colors";

type DriverCardProps = {
  driver: Driver;
};

export function DriverCard({ driver }: DriverCardProps) {
  const flag = driver.nationality ? countryToFlagEmoji(driver.nationality) : "";
  const teamColor = getConstructorColor(driver.teamId || "");
  const gradientBg = `linear-gradient(135deg, ${teamColor}, ${teamColor}22, transparent)`;

  return (
    <Card
      className="border-dashed bg-card/80 backdrop-blur transition hover:-translate-y-1 hover:shadow-md"

    >
      <CardHeader className="pb-2 flex flex-row justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-semibold text-primary"
            style={{ background: gradientBg }}
          >
            #{driver.number ?? "–"}
          </div>
          <CardTitle className="text-xl">
            {driver.name} {driver.surname}
          </CardTitle>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {driver.teamId ? driver.teamId : "Équipe inconnue"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <div className="text-xs">Nation</div>
          <div className="uppercase tracking-widest align-center font-medium text-foreground flex items-center gap-2">
            {flag && <span className="text-lg ">{flag}</span>}
            {driver.nationality ?? "N/A"}
          </div>
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
