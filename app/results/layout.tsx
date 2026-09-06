import type { Metadata } from "next";

/**
 * `app/results/page.tsx` est un composant client (défilement infini) et ne peut
 * donc pas exporter de `metadata`. Ce layout le fait à sa place ; les routes
 * imbriquées (`[season]`, `[season]/[round]`) définissent la leur et priment.
 */
export const metadata: Metadata = {
  title: "Résultats — CleanLap",
  description:
    "Les résultats de Formule 1 saison par saison, de 1950 à aujourd'hui : vainqueurs, champions et classements de chaque manche.",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
