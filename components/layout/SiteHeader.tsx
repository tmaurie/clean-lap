"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {Github} from "lucide-react";
import {useEffect, useState} from "react";

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Calendrier", href: "/calendar" },
  { name: "Classements", href: "/standings" },
  { name: "Résultats", href: "/results" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  return (
    <header className={cn(
        'sticky top-0 z-50 w-full bg-background transition-all',
        scrolled && 'shadow-sm backdrop-blur-lg bg-background/80 border-b',
    )}>
      <div className=" flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          CleanLap 🏎️
        </h1>

        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                pathname === item.href && "text-foreground font-semibold",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <Link
            href="https://github.com/ton-utilisateur/cleanlap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Github className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
