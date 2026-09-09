import type { Metadata } from "next";

import { CalendarView } from "@/components/calendar/CalendarView";
import { getRacesWithWinner } from "@/features/results/hooks";
import { normalizeSeason } from "@/lib/utils/season";

export const revalidate = 60;

type CalendarPageProps = {
  searchParams: Promise<{ season?: string }>;
};

export async function generateMetadata({
  searchParams,
}: CalendarPageProps): Promise<Metadata> {
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);

  return {
    title: `Calendrier ${season} — CleanLap`,
    description: `Le calendrier complet de la saison ${season} de Formule 1 : manches disputées, vainqueurs, et courses à venir avec leurs horaires.`,
  };
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const { season: requested } = await searchParams;
  const season = normalizeSeason(requested);

  // Le calendrier était récupéré depuis le navigateur, avec la saison dans un
  // `useState`. Résolu ici, il est mutualisé par le cache de fetch et la
  // saison vit dans l'URL.
  const races = await getRacesWithWinner(season).catch((error: unknown) => {
    // `null` (et non `[]`) : une panne de l'API ne doit pas se lire comme une
    // saison sans course.
    console.warn(`[calendar] saison ${season} indisponible`, error);
    return null;
  });

  return <CalendarView season={season} races={races} />;
}
