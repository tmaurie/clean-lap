import { ResultsPageClient } from "@/app/results/ResultsPageClient";
import { useSeasonWithRaceCount } from "@/features/results/hooks";

export default async function ResultsIndexPage() {
  const seasons = await useSeasonWithRaceCount();
  return <ResultsPageClient seasons={seasons} />;
}
