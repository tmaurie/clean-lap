import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProviders } from "@/providers/theme-providers";
import { Shell } from "@/components/layout/Shell";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanLap",
  description: "Refonte clean et typée d’une app F1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <NextTopLoader color="#fff" height={2} showSpinner={false} />
        <ThemeProviders>
          <Shell>{children}</Shell>
        </ThemeProviders>
      </body>
    </html>
  );
}
