"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Driver } from "@/entities/driver/model";

/**
 * Sélecteur écrivant dans l'URL, comme les autres de l'app : la page de
 * comparaison reste un Server Component et le lien est partageable.
 */
export function DriverPicker({
  param,
  label,
  value,
  drivers,
}: {
  param: "d1" | "d2";
  label: string;
  value: string | null;
  drivers: Driver[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (driverId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(param, driverId);
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className="flex flex-col gap-2"
      aria-busy={isPending}
      style={isPending ? { opacity: 0.6 } : undefined}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/55">
        {label}
      </span>
      <Select value={value ?? undefined} onValueChange={handleChange}>
        <SelectTrigger
          aria-label={label}
          className="h-11 w-[240px] border-white/15 font-mono text-xs font-bold uppercase tracking-[0.08em]"
        >
          <SelectValue placeholder="Choisir un pilote" />
        </SelectTrigger>
        <SelectContent className="max-h-[320px] overflow-y-auto">
          {drivers.map((driver) => (
            <SelectItem key={driver.id} value={driver.id}>
              {driver.name} {driver.surname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
