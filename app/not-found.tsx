import Link from "next/link";

import { GhostNumber } from "@/components/paddock/GhostNumber";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";

const SUGGESTIONS = [
  { href: "/weekend", label: "Week-end en cours" },
  { href: "/calendar", label: "Calendrier" },
  { href: "/standings", label: "Classements" },
  { href: "/results", label: "Résultats" },
];

export default function NotFound() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12 md:py-20">
        <HatchOverlay />
        <GhostNumber className="-bottom-6 left-6 hidden text-[240px] md:left-12 md:block">
          404
        </GhostNumber>

        <div className="relative flex flex-col gap-8">
          <SectionEyebrow>Erreur 404</SectionEyebrow>

          <h1 className="max-w-3xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Page introuvable
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            Cette page n&apos;existe pas — ou la manche demandée n&apos;est pas
            au calendrier de la saison. Vérifiez l&apos;adresse, ou repartez
            d&apos;une de ces pages.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex h-[52px] items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Retour à l&apos;accueil →
            </Link>
          </div>

          <nav
            aria-label="Autres pages"
            className="grid w-fit grid-cols-2 gap-px border border-white/8 bg-white/8 sm:grid-cols-4"
          >
            {SUGGESTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-background px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:bg-[#12151a] hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
