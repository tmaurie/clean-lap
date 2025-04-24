import {fetchSeasonsWithRaceCount} from '@/lib/api/results'
import {ResultsPageClient} from "@/app/results/ResultsPageClient";

export default async function ResultsIndexPage() {
    const seasons = await fetchSeasonsWithRaceCount()

    return <ResultsPageClient seasons={seasons} />
}
