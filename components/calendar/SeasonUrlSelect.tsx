"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { SeasonSelect } from "@/components/calendar/SeasonSelect";

/**
 * Sélecteur de saison qui écrit dans l'URL (`?season=`) au lieu d'un état
 * local. La page reste donc un Server Component, le lien est partageable et
 * le retour arrière du navigateur fonctionne.
 */
export function SeasonUrlSelect({
  value,
  triggerClassName,
}: {
  value: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (season: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", season);
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div aria-busy={isPending} className={isPending ? "opacity-60" : undefined}>
      <SeasonSelect
        value={value}
        action={handleChange}
        triggerClassName={triggerClassName}
      />
    </div>
  );
}
