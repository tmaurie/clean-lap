"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSeasonProgress } from "@/features/season/useSeasonProgress";

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Calendrier", href: "/calendar" },
  { name: "Pilotes", href: "/drivers" },
  { name: "Classements", href: "/standings" },
  { name: "Résultats", href: "/results" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: progress } = useSeasonProgress();

  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-border bg-background/92 px-6 backdrop-blur-md md:px-12">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/cleanlaplogo.png"
          alt="CleanLap"
          width={36}
          height={36}
          priority
        />
        <span className="text-xl font-black italic uppercase tracking-tight">
          CleanLap
        </span>
      </Link>

      <nav className="hidden items-center gap-8 text-[13px] font-semibold uppercase tracking-[0.1em] text-foreground/55 md:flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "border-b-2 border-transparent py-[26px] transition-colors hover:text-foreground",
                isActive && "border-primary text-foreground",
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-2 font-mono text-[11px] text-foreground/55 sm:flex">
        <span className="h-[7px] w-[7px] animate-blink rounded-full bg-[#2fbf5f]" />
        {progress
          ? `SAISON ${progress.year} · R${progress.round}/${progress.total}`
          : "—"}
      </div>
    </header>
  );
}
