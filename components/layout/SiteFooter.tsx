import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t mt-10">
      <div className=" py-6 text-center bg-background text-xs text-muted-foreground ">
        © {new Date().getFullYear()} CleanLap   v{process.env.NEXT_PUBLIC_VERSION}. Tous droits réservés.
        <br />
        Conçu et développé avec 🏎️ par
        <Link
          href="https://www.github.com/tmaurie"
          target="_blank"
          className="text-primary hover:text-foreground transition-colors"
        >
          {" "}
          @tmaurie
        </Link>
      </div>
    </footer>
  );
}
