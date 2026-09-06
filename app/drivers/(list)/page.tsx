import type { Metadata } from "next";

import { DriversPageClient } from "@/components/drivers/DriversPageClient";
import { fetchDrivers } from "@/lib/api/drivers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pilotes — CleanLap",
  description:
    "Les pilotes de Formule 1 saison par saison : nationalité, numéro, écurie.",
};

const ALLOWED_SEASONS = [
  "current",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
] as const;

type DriversPageProps = {
  searchParams: Promise<{ season?: string }>;
};

export default async function DriversPage({ searchParams }: DriversPageProps) {
  const { season: requested } = await searchParams;
  const season = ALLOWED_SEASONS.includes(
    requested as (typeof ALLOWED_SEASONS)[number],
  )
    ? (requested as string)
    : "current";

  // La liste est récupérée ici plutôt que par React Query côté navigateur :
  // c'était le dernier consommateur de la librairie dans toute l'app.
  // La recherche et le filtre écurie restent purement client, sans requête —
  // `fetchDrivers` filtrait déjà en mémoire.
  const drivers = await fetchDrivers({ season });

  return <DriversPageClient season={season} drivers={drivers} />;
}
