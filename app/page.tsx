import { UpcomingRaces } from "@/components/home/UpcomingRaces";

export default function HomePage() {
  return (
    <section className="grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2">
      <UpcomingRaces />
    </section>
  );
}
