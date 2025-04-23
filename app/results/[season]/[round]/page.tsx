import { fetchRaceResults } from '@/lib/api/race'

export default async function ResultsPage({
                                              params,
                                          }: {
    params: { season: string; round: number }
}) {
    const { season, round } = params
    const data = await fetchRaceResults(season, round)

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Résultats — {data.raceName} ({season}, round {round})</h1>

            <ul className="text-sm space-y-1">
                {data.results.slice(0, 5).map((r) => (
                    <li key={r.position}>
                        <strong>{r.position}.</strong> {r.driver} — {r.constructor} — {r.points} pts
                    </li>
                ))}
            </ul>
        </div>
    )
}
