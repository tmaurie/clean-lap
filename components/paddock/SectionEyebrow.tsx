import { cn } from "@/lib/utils";

export function SectionEyebrow({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  /** Overrides the default red accent (e.g. a team color). */
  color?: string;
}) {
  return (
    // `min-w-0` : sans lui, l'élément flex prend sa largeur min-content, donc
    // le texte ne passe jamais à la ligne et pousse toute la page. Un intitulé
    // comme « Championnat du monde — Saison 2026 » faisait 337 px de large sur
    // un écran de 320.
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <span
        className={cn("h-[3px] w-8 shrink-0", !color && "bg-primary")}
        style={color ? { background: color } : undefined}
      />
      <span
        className={cn(
          "min-w-0 text-xs font-bold uppercase tracking-[0.2em]",
          !color && "text-primary",
        )}
        style={color ? { color } : undefined}
      >
        {children}
      </span>
    </div>
  );
}
