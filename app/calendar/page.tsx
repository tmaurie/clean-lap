import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export default function CalendarPage({
  searchParams,
}: {
  searchParams: { season?: string; view?: string };
}) {
  const view = searchParams.view || "list";

  return <CalendarPageClient initialView={view} />;
}
