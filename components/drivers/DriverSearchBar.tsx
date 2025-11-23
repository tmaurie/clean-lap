"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DriverSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DriverSearchBar({
  value,
  onChange,
  placeholder = "Rechercher un pilote (nom, prénom, id)",
}: DriverSearchBarProps) {
  const [internal, setInternal] = useState(value);

  useEffect(() => setInternal(value), [value]);

  // debounce simple
  useEffect(() => {
    const t = setTimeout(() => {
      if (internal !== value) onChange(internal);
    }, 300);
    return () => clearTimeout(t);
  }, [internal, value, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-9")}
      />
    </div>
  );
}
