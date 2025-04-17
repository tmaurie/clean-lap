import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProviders } from "@/providers/theme-providers";

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
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  );
}
