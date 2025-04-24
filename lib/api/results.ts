export async function fetchSeasonsWithRaceCount(): Promise<{ season: string; raceCount: number }[]> {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/seasons.json?limit=100')
    const json = await res.json()
    const seasons = json?.MRData?.SeasonTable?.Seasons ?? []

    return await Promise.all(
        seasons.reverse().map(async (s: any) => {
            const r = await fetch(`https://api.jolpi.ca/ergast/f1/${s.season}.json`)
            const data = await r.json()
            const count = data.MRData.RaceTable?.Races?.length ?? 0
            return {
                season: s.season,
                raceCount: count,
            }
        })
    )
}
