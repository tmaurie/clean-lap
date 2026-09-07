"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitCompareArrows,
  Home,
  CalendarDays,
  BarChart2,
  Flag,
  Factory,
  Timer,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/lib/hooks";

const navItems = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Week-end", href: "/weekend", icon: Timer },
  { name: "Calendrier", href: "/calendar", icon: CalendarDays },
  { name: "Pilotes", href: "/drivers", icon: User },
  { name: "Écuries", href: "/teams", icon: Factory },
  { name: "Duels", href: "/compare", icon: GitCompareArrows },
  { name: "Classements", href: "/standings", icon: BarChart2 },
  { name: "Résultats", href: "/results", icon: Flag },
];

export function BottomNav() {
  const pathname = usePathname();
  const scrollDir = useScrollDirection();

  return (
    <nav
      className={cn(
        // Visible jusqu'à `lg` : c'est elle qui porte la navigation tant que
        // l'en-tête ne peut pas afficher la sienne sans déborder.
        "fixed bottom-0 z-50 w-full border-t border-border bg-background/95 backdrop-blur-md transition-transform duration-300 lg:hidden",
        scrollDir === "down" ? "translate-y-full" : "translate-y-0",
      )}
    >
      <div className="flex h-14 items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center px-1 text-foreground/55 transition-all duration-150 ease-out active:scale-95",
                isActive && "text-primary",
              )}
            >
              {/* Le libellé n'apparaît que sur l'onglet actif : à sept entrées,
                  sept libellés ne tiennent pas sous 360 px (mesuré). L'icône
                  reste nommée pour les lecteurs d'écran. */}
              <Icon className="h-5 w-5" aria-hidden />
              <span className="sr-only">{item.name}</span>
              {isActive && (
                <span
                  aria-hidden
                  className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide"
                >
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
