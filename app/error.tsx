"use client";

import { useEffect } from "react";
import Link from "next/link";

import { GhostNumber } from "@/components/paddock/GhostNumber";
import { HatchOverlay } from "@/components/paddock/HatchOverlay";
import { SectionEyebrow } from "@/components/paddock/SectionEyebrow";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] rendu interrompu", error);
  }, [error]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border px-6 py-14 md:px-12 md:py-20">
        <HatchOverlay />
        <GhostNumber className="-bottom-6 left-6 hidden text-[240px] md:left-12 md:block">
          500
        </GhostNumber>

        <div className="relative flex flex-col gap-8">
          <SectionEyebrow>Drapeau rouge</SectionEyebrow>

          <h1 className="max-w-3xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Séance interrompue
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            Cette page n&apos;a pas pu être affichée. Les données F1 viennent
            d&apos;une API publique qui peut être momentanément indisponible :
            réessayer suffit le plus souvent.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-[52px] items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex h-[52px] items-center border border-white/20 px-9 text-sm font-bold uppercase tracking-[0.08em] transition-colors hover:border-white/50"
            >
              Retour à l&apos;accueil
            </Link>
          </div>

          {error.digest && (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/35">
              Référence : {error.digest}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
