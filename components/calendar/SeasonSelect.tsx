"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const seasons = Array.from(
  { length: new Date().getFullYear() - 1950 + 1 },
  (_, i) => (new Date().getFullYear() - i).toString(),
);

export function SeasonSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current =
    searchParams.get("season") || new Date().getFullYear().toString();

  const handleChange = (season: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("season", season);
    router.push(`/calendar?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleChange} value={current}>
      <SelectTrigger className="w-[160px] md:w-[180px]">
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
