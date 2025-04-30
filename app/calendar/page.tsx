import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";

export default function CalendarPage({ searchParams }: any) {
  const view = searchParams?.view || "list";
  return <CalendarPageClient initialView={view} />;
}
