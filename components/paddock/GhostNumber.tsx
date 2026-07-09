import { cn } from "@/lib/utils";

export function GhostNumber({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute select-none font-black italic leading-[0.7] tracking-[-0.05em] text-white/[0.035]",
        className,
      )}
    >
      {children}
    </div>
  );
}
