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
          "w-[160px] rounded-xl border border-primary/20 bg-background/80 backdrop-blur transition-colors hover:border-primary/40 focus:ring-2 focus:ring-primary/30",
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
