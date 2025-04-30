import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProviders } from "@/providers/theme-providers";
import { Shell } from "@/components/layout/Shell";
import NextTopLoader from "nextjs-toploader";

const geist = Geist({ subsets: ["latin"] });

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
    <html lang="fr" suppressHydrationWarning>
      <body className={geist.className}>
        <NextTopLoader color="#fff" height={2} showSpinner={false} />
        <ThemeProviders>
          <Shell>{children}</Shell>
        </ThemeProviders>
      </body>
    </html>
  );
}
