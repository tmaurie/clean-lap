import "./globals.css";
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { Shell } from "@/components/layout/Shell";
import NextTopLoader from "nextjs-toploader";
import React from "react";

const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "CleanLap",
  description: "Résultats et statistiques F1.",
  openGraph: {
    title: "CleanLap",
    description:
      "Une application pour les fans de Formule 1. Votre tableau de bord F1 clair, rapide et accessible.",
    url: "https://cleanlap.vercel.app",
    siteName: "CleanLap",
    locale: "fr_FR",
    type: "website",
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
        <QueryProvider>
          <Shell>{children}</Shell>
        </QueryProvider>
      </body>
    </html>
  );
}
