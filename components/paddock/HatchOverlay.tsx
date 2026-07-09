import { cn } from "@/lib/utils";

export function HatchOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 w-[42%]",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)",
      }}
    />
  );
}
