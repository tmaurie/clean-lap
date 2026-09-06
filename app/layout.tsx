import "./globals.css";
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Shell } from "@/components/layout/Shell";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import NextTopLoader from "nextjs-toploader";
import React from "react";

// Archivo est une police variable (axe wght 100-900) : sans liste de graisses,
// next/font charge deux fichiers variables (normal + italique) au lieu de
// douze instances statiques, et toutes les graisses restent disponibles.
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
});

// IBM Plex Mono n'est pas variable : les graisses sont explicites. 700 est
// ajoutée parce que `font-mono font-bold` est utilisé une douzaine de fois et
// que le navigateur devait jusqu'ici synthétiser un faux gras ; 500 est
// retirée, aucun `font-medium` ne l'accompagne.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  // `metadataBase` permet à Next de résoudre les URL relatives (OpenGraph,
  // canoniques) ; sans elle, il avertit au build et émet des URL cassées.
  metadataBase: new URL(SITE_URL),
  title: "CleanLap — Tableau de bord Formule 1",
  description:
    "Prochaine course, résultats, classements et calendrier de Formule 1, en un coup d'œil.",
  applicationName: SITE_NAME,
  openGraph: {
    title: "CleanLap — Tableau de bord Formule 1",
    description:
      "Une application pour les fans de Formule 1. Votre tableau de bord F1 clair, rapide et accessible.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CleanLap — Tableau de bord Formule 1",
    description:
      "Prochaine course, résultats, classements et calendrier de Formule 1.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className={archivo.className}>
        <NextTopLoader color="#ff2c2c" height={2} showSpinner={false} />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
