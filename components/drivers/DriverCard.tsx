"use client";

import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const birthLabel =
    driver.birthday && !Number.isNaN(Date.parse(driver.birthday))
      ? new Date(driver.birthday).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Date inconnue";
  const teamLabel = driver.teamId ? driver.teamId : "Equipe inconnue";

  return (
    <Card className="border-dashed bg-card/80 backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="flex flex-row justify-between pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-lg font-semibold text-primary"
            style={{ background: gradientBg }}
          >
            #{driver.number ?? "?"}
          </div>
          <CardTitle className="text-xl">
            {driver.name} {driver.surname}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {teamLabel}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Apercu rapide du pilote"
              >
                <Info className="h-4 w-4" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Numero</span>
                  <span className="font-medium text-foreground">
                    {driver.number ?? "?"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Equipe</span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: teamColor || "var(--foreground)" }}
                    />
                    {teamLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Nationalite</span>
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {flag && <span className="text-lg">{flag}</span>}
                    {driver.nationality ?? "Inconnue"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Naissance</span>
                  <span className="font-medium text-foreground">
                    {birthLabel}
                  </span>
                </div>
                {driver.shortName && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Code FIA</span>
                    <span className="font-mono text-foreground">
                      {driver.shortName}
                    </span>
                  </div>
                )}
                <Link
                  href={`/drivers/${driver.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Voir la fiche pilote{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <div className="text-xs">Nation</div>
          <div className="flex items-center gap-2 font-medium uppercase tracking-widest text-foreground">
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
