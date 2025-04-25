"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutList, LayoutGrid, Timer } from "lucide-react";

export function ViewToggle({
  value,
  action,
}: {
  value: string;
  action: (view: string) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) action(v);
      }}
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
