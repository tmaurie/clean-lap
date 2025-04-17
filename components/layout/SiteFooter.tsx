export function SiteFooter() {
  return (
    <footer className="w-full border-t mt-10">
      <div className="container py-6 text-center text-xs text-muted-foreground max-h-1">
        © {new Date().getFullYear()} CleanLap. Tous droits réservés.
      </div>
    </footer>
  );
}
