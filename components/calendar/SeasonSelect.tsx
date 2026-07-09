"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const seasons = Array.from(
  { length: new Date().getFullYear() - 1950 + 1 },
  (_, i) => (new Date().getFullYear() - i).toString(),
);

export function SeasonSelect({
  value,
  action,
  triggerClassName,
}: {
  value: string;
  action: (season: string) => void;
  triggerClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={action}>
      <SelectTrigger
        className={cn(
          "h-11 w-[160px] border border-white/15 bg-transparent font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:border-white/40 hover:text-foreground",
          triggerClassName,
        )}
      >
        <SelectValue placeholder="Saison" />
      </SelectTrigger>
      <SelectContent className="overflow-y-auto max-h-[300px]">
        {seasons.map((year) => (
          <SelectItem key={year} value={year}>
            {year}{" "}
            {year === new Date().getFullYear().toString() && "(actuelle)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
