"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, LayoutGrid, Timer } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export function ViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("view") || "list";

  const handleChange = (value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("view", value);
    router.push(`/calendar?${params.toString()}`);
  };

  return (
    <ToggleGroup
      type="single"
      value={current}
      onValueChange={handleChange}
      className="ml-2"
    >
      <ToggleGroupItem value="list" aria-label="Vue liste">
        <LayoutList className="w-4 h-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Vue grille">
        <LayoutGrid className="w-4 h-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="timeline" aria-label="Vue timeline">
        <Timer className="w-4 h-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
