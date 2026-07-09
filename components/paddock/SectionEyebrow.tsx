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
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn("h-[3px] w-8", !color && "bg-primary")}
        style={color ? { background: color } : undefined}
      />
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-[0.2em]",
          !color && "text-primary",
        )}
        style={color ? { color } : undefined}
      >
        {children}
      </span>
    </div>
  );
}
