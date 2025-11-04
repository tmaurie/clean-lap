"use client";

import { useState } from "react";
import { Trophy, UsersRound } from "lucide-react";

import { SeasonSelect } from "@/components/calendar/SeasonSelect";
import { StandingsTabs } from "@/components/standings/StandingsTabs";
import { DotPattern } from "@/components/magicui/dot-pattern";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StandingsPage() {
  const [season, setSeason] = useState(new Date().getFullYear().toString());

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-primary/10 to-primary/20 p-8 shadow-sm">
        <DotPattern className="text-primary/40 [mask-image:radial-gradient(circle_at_top,white,transparent_65%)]" />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="w-fit">
              Classements officiels
            </Badge>
            <div className="space-y-3 text-balance">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Saison {season}
              </h1>
              <p className="text-muted-foreground">
                Suivez l&apos;évolution du championnat pilote et constructeur,
                course après course. Choisissez une saison pour revoir les
                batailles qui ont marqué l&apos;histoire de la F1.
              </p>
            </div>
          </div>
          <div className="w-full max-w-xs space-y-4 rounded-2xl border border-primary/30 bg-background/80 p-5 backdrop-blur">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Choisir une saison
              </p>
              <SeasonSelect
                value={season}
                action={setSeason}
                triggerClassName="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Données mises à jour en continu dès la publication officielle des
              classements par la FIA.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Classements en direct
            </h2>
            <p className="text-sm text-muted-foreground">
              Passez d&apos;un onglet à l&apos;autre pour comparer les pilotes
              et les écuries d&apos;un simple coup d&apos;œil.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-muted-foreground/20 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" aria-hidden />
              Points &amp; victoires actualisés après chaque Grand Prix
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-muted-foreground/20 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
              <UsersRound className="h-4 w-4 text-primary" aria-hidden />
              Classements complets jusqu&apos;au dernier engagé
            </div>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Analyse interactive</CardTitle>
            <CardDescription>
              Visualisez les écarts de points et les dynamiques du championnat
              pour la saison sélectionnée.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <StandingsTabs season={season} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
