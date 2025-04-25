import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProviders } from "@/providers/theme-providers";
import { Shell } from "@/components/layout/Shell";
import NextTopLoader from "nextjs-toploader";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanLap",
  description: "Une application pour les fans de Formule 1",
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
          <DotPattern
            cr={1}
            className={cn(
              "fixed inset-0 -z-10 pointer-events-none",
              "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            )}
          />
          <Shell>{children}</Shell>
        </ThemeProviders>
      </body>
    </html>
  );
}
