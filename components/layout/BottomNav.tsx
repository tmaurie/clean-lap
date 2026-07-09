"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, BarChart2, Flag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/lib/hooks";

const navItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Calendrier", href: "/calendar", icon: CalendarDays },
  { name: "Pilotes", href: "/drivers", icon: User },
  { name: "Classements", href: "/standings", icon: BarChart2 },
  { name: "Résultats", href: "/results", icon: Flag },
];

export function BottomNav() {
  const pathname = usePathname();
  const scrollDir = useScrollDirection();

  return (
    <nav
      className={cn(
        "fixed bottom-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur-md transition-transform duration-300 md:hidden",
        scrollDir === "down" ? "translate-y-full" : "translate-y-0",
      )}
    >
      <div className="flex h-14 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-foreground/55 transition-all duration-150 ease-out active:scale-95",
                isActive && "text-primary",
              )}
            >
              <Icon className="mb-0.5 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
