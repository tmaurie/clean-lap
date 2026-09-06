import type { Metadata } from "next";

import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export const metadata: Metadata = {
  title: "Calendrier — CleanLap",
  description:
    "Le calendrier complet de la saison de Formule 1 : manches disputées, vainqueurs, et courses à venir avec leurs horaires.",
};

export default function CalendarPage() {
  return <CalendarPageClient />;
}
