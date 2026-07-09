import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-between gap-4 border-t border-border px-6 py-6 text-xs text-foreground/45 md:px-12">
      <span className="font-bold italic uppercase tracking-wide">
        CleanLap © {new Date().getFullYear()}
        {process.env.NEXT_PUBLIC_VERSION
          ? ` v${process.env.NEXT_PUBLIC_VERSION}`
          : ""}
      </span>
      <span>
        Conçu et développé avec 🏎️ par{" "}
        <Link
          href="https://www.github.com/tmaurie"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80"
        >
          @tmaurie
        </Link>{" "}
        · Données f1api.dev
      </span>
    </footer>
  );
}
