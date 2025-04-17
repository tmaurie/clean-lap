'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Calendrier', href: '/calendar' },
    { name: 'Classements', href: '/standings' },
    { name: 'Résultats', href: '/results' },
]

export function SiteHeader() {
    const pathname = usePathname()

    return (
        <header className="w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between px-4">
                <h1 className="text-xl font-bold tracking-tight text-primary">🏎️ CleanLap</h1>

                <nav className="flex items-center gap-4 text-sm font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'text-muted-foreground hover:text-foreground transition-colors',
                                pathname === item.href && 'text-foreground font-semibold'
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
