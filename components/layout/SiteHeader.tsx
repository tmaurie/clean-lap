"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Calendrier", href: "/calendar" },
  { name: "Classements", href: "/standings" },
  { name: "Résultats", href: "/results" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "flex h-16 items-center space-x-4 sm:justify-around sm:space-x-0",
        scrolled && "shadow-sm backdrop-blur-lg bg-background/80 border-b",
      )}
    >
      <div className=" container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cleanlaplogo.png"
            alt="CleanLap"
            width={48}
            height={48}
            priority
          />
          <h1 className="text-balance text-2xl font-semibold leading-none tracking-tighter">
            Clean
            <LineShadowText className="italic" shadowColor="white">
              Lap
            </LineShadowText>
          </h1>
        </Link>

        <nav className="hidden md:flex items-center flex-1 px-6 font-mono gap-4 text-sm font-medium">
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="https://github.com/tmaurie/clean-lap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
