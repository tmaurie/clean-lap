"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const seasons = Array.from(
  { length: new Date().getFullYear() - 1950 + 1 },
  (_, i) => (new Date().getFullYear() - i).toString(),
);

export function SeasonSelect({
  value,
  action,
}: {
  value: string;
  action: (season: string) => void;
}) {
  return (
    <Select value={value} onValueChange={action}>
      <SelectTrigger className="w-[160px] border border-muted rounded-md">
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
