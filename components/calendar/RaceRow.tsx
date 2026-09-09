import { cn } from "@/lib/utils";

/**
 * Ligne de course, partagée par le calendrier et la page d'une saison — les
 * deux affichaient le même gabarit, recopié.
 *
 * En dessous de `sm` elle se replie sur deux lignes : manche + drapeau + nom,
 * puis le bloc de droite (`children`) passé en `col-span-3`. Au-dessus,
 * `sm:flex` sur la ligne et `sm:contents` sur ce bloc restituent exactement la
 * ligne unique d'origine. Sans ça, les colonnes fixes réclamaient 600 px sur
 * un écran de 320 et toute la page scrollait horizontalement.
 */
export function RaceRow({
  round,
  flag,
  name,
  subtitle,
  accentColor,
  className,
  style,
  children,
}: {
  round: string | number;
  flag: string;
  name: string;
  subtitle?: string;
  /** Couleur du numéro de manche. Par défaut, le gris de la liste. */
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Bloc de droite : badge, vainqueur, date, lien… */
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_auto_1fr] items-center gap-x-4 gap-y-2 border-b border-border py-4 sm:flex sm:gap-8 sm:py-5",
        className,
      )}
      style={style}
    >
      <span
        className="text-2xl font-black italic sm:w-[70px] sm:text-3xl"
        style={{ color: accentColor ?? "rgba(244,244,242,0.4)" }}
      >
        R{round}
      </span>
      <span className="text-xl sm:w-8 sm:text-2xl">{flag}</span>
      <div className="flex min-w-0 flex-col gap-0.5 sm:w-0 sm:flex-1">
        <span className="text-[15px] font-extrabold uppercase tracking-wide sm:text-[17px]">
          {name}
        </span>
        {subtitle && (
          <span className="text-xs text-foreground/50">{subtitle}</span>
        )}
      </div>
      <div className="col-span-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:contents">
        {children}
      </div>
    </div>
  );
}
