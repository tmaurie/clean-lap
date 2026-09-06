"use client";

import "./globals.css";

/**
 * Dernier filet : `error.tsx` ne rattrape pas une erreur survenue dans le
 * layout racine. Ce composant remplace tout le document, il ne peut donc
 * réutiliser ni le Shell ni les polices — il reste volontairement minimal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center bg-background px-6 py-14 text-foreground md:px-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="h-[3px] w-8 bg-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Drapeau rouge
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-black italic uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Séance interrompue
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-foreground/55">
            L&apos;application n&apos;a pas pu démarrer. Réessayer suffit le
            plus souvent.
          </p>

          <button
            type="button"
            onClick={reset}
            className="inline-flex h-[52px] w-fit items-center bg-primary px-9 text-sm font-extrabold uppercase italic tracking-[0.08em] text-primary-foreground"
          >
            Réessayer
          </button>

          {error.digest && (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/35">
              Référence : {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
