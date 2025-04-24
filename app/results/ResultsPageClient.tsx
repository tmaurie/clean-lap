'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'

type Season = { season: string; raceCount: number }

export function ResultsPageClient({ seasons }: { seasons: Season[] }) {
    const [visible, setVisible] = useState(10)

    const loadMore = () => {
        setVisible((prev) => prev + 10)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Historique des résultats"
                description="Choisissez une saison pour explorer les résultats"
            />

            <ul className="space-y-2">
                {seasons.slice(0, visible).map((s) => (
                    <li key={s.season}>
                        <Link
                            href={`/results/${s.season}`}
                            className="flex justify-between items-center px-4 py-3 rounded-md border hover:bg-muted transition"
                        >
                            <span className="font-medium">{s.season}</span>
                            <span className="text-sm text-muted-foreground">
                {s.raceCount} Grands Prix
              </span>
                        </Link>
                    </li>
                ))}
            </ul>

            {visible < seasons.length && (
                <div className="pt-4 text-center">
                    <Button variant="outline" onClick={loadMore}>
                        Charger plus
                    </Button>
                </div>
            )}
        </div>
    )
}
