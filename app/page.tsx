import Link from "next/link";
import {
  CalendarClock,
  Check,
  Flag,
  Gauge,
  LineChart,
  Trophy,
  Zap,
} from "lucide-react";

import { NextRaceCountdown } from "@/components/home/NextRaceCountdown";
import { RaceResultsTable } from "@/components/home/RaceResultTable";
import { StandingsPreview } from "@/components/home/StandingsPreview";
import { UpcomingRaces } from "@/components/home/UpcomingRaces";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const features = [
    {
      title: "Résultats instantanés",
      description:
        "Analysez chaque Grand Prix avec des tableaux clairs, des écarts tour par tour et une mise à jour continue des classements.",
      icon: <LineChart className="h-5 w-5" aria-hidden />,
    },
    {
      title: "Calendrier intelligent",
      description:
        "Visualisez la saison complète, repérez les back-to-back et laissez CleanLap vous prévenir avant le départ de la prochaine course.",
      icon: <CalendarClock className="h-5 w-5" aria-hidden />,
    },
    {
      title: "Suivi des performances",
      description:
        "Comparez les pilotes et les écuries, identifiez les progressions et mesurez l&apos;impact d&apos;un week-end sur le championnat.",
      icon: <Trophy className="h-5 w-5" aria-hidden />,
    },
    {
      title: "Pensé pour la vitesse",
      description:
        "Un design épuré, sombre ou clair, optimisé pour mobile comme desktop afin de consulter vos données sans friction.",
      icon: <Zap className="h-5 w-5" aria-hidden />,
    },
  ];

  const highlights = [
    {
      value: "24",
      label: "courses couvertes",
      description: "De Bahreïn à Abu Dhabi pour la saison 2024.",
    },
    {
      value: "< 2 s",
      label: "pour charger les résultats",
      description: "Un accès immédiat aux classements détaillés après chaque drapeau à damier.",
    },
    {
      value: "100 %",
      label: "compatible mobile",
      description: "Consultez CleanLap depuis le paddock, le canapé ou le métro.",
    },
  ];

  const steps = [
    {
      title: "Choisissez une course",
      description:
        "Accédez en un clic aux faits marquants, aux horaires et aux infos circuit de chaque week-end.",
    },
    {
      title: "Analysez les classements",
      description:
        "Passez du classement pilotes aux constructeurs, filtrez par saison et suivez les points clés.",
    },
    {
      title: "Passez à l&apos;action",
      description:
        "Activez vos rappels et partagez vos statistiques favorites avec vos amis fans de F1.",
    },
  ];

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-transparent">
        <DotPattern
          className="text-primary/40 [mask-image:radial-gradient(circle_at_top,white,transparent_65%)]"
          glow
        />

        <div className="relative grid gap-12 px-6 py-16 md:grid-cols-[3fr_2fr] md:px-12 lg:px-16">
          <div className="space-y-8">
            <Badge variant="secondary" className="w-fit">Tableau de bord F1</Badge>
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                La façon la plus claire de suivre la Formule 1 est
                <span className="block bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent">
                  CleanLap
                </span>
              </h1>
              <p className="text-balance text-muted-foreground">
                Données officielles, insights limpides et une interface pensée pour aller à l&apos;essentiel. Que vous soyez fan du dimanche ou analyste invétéré, CleanLap vous accompagne tout au long de la saison.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {["Alertes avant chaque départ", "Comparaison des pilotes en temps réel", "Mode sombre pour les sessions de nuit", "Historique des saisons depuis 2014"].map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl border bg-card/60 p-4 backdrop-blur">
                  <Check className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/calendar">Explorer la saison 2024</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                <Link href="#fonctionnalites">Découvrir les fonctionnalités</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-background/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gauge className="h-5 w-5 text-primary" aria-hidden />
                  Prochaine course
                </CardTitle>
                <CardDescription>
                  Préparez-vous avec le compte à rebours officiel et les infos circuit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <NextRaceCountdown />
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
                  Utilisez CleanLap pour activer un rappel personnalisé et ne plus manquer un départ.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        className="space-y-8"
        aria-label="Accès rapide aux informations clés"
      >
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            Toujours à jour
          </Badge>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              L&apos;essentiel du championnat en un clin d&apos;œil
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Un trio de tableaux condensés pour revivre la dernière arrivée, surveiller les prochaines étapes et suivre la bataille aux classements.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-primary/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flag className="h-5 w-5 text-primary" aria-hidden />
                Résultat de la dernière course
              </CardTitle>
              <CardDescription>
                Les trois premiers du Grand Prix précédent et leurs points marqués.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RaceResultsTable
                season="current"
                round="last"
                limit={3}
                ctaHref="/results/current/last"
                ctaLabel="Analyser le Grand Prix"
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarClock className="h-5 w-5 text-primary" aria-hidden />
                Courses à suivre
              </CardTitle>
              <CardDescription>
                Anticipez les prochaines manches du calendrier officiel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingRaces limit={4} />
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LineChart className="h-5 w-5 text-primary" aria-hidden />
                Classement courant
              </CardTitle>
              <CardDescription>
                Les leaders pilotes et constructeurs, en attendant le prochain drapeau à damier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StandingsPreview driverLimit={5} constructorLimit={5} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3" aria-label="Chiffres clés">
        {highlights.map((highlight) => (
          <Card key={highlight.label} className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-primary">
                {highlight.value}
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                {highlight.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {highlight.description}
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="fonctionnalites" className="space-y-8">
        <div className="flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto w-fit">
            Fonctionnalités principales
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Tout ce dont vous avez besoin pour vivre la saison à 360°
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
            CleanLap rassemble calendrier, classements et statistiques avancées dans un seul espace pour rester informé avant, pendant et après chaque Grand Prix.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/80 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  {feature.icon}
                </div>
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3" aria-label="Comment utiliser CleanLap">
        {steps.map((step, index) => (
          <Card key={step.title} className="bg-background/80 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-lg font-semibold text-primary">
                {index + 1}
              </div>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {step.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-primary/10 to-primary/20 p-10 text-center">
        <DotPattern className="text-primary/30" width={24} height={24} cx={2} cy={2} cr={1} />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <Badge variant="secondary" className="w-fit">
            Prêt à prendre le départ ?
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Rejoignez la communauté CleanLap et vivez chaque tour comme si vous étiez sur le muret.
          </h2>
          <p className="text-balance text-muted-foreground">
            Renseignez-vous sur les prochaines courses, revivez les résultats et partagez vos analyses. CleanLap est gratuit et accessible partout.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/standings">Consulter les classements en direct</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
              <Link href="/results">Voir les derniers résultats</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
