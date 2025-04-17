'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, BarChart2, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Calendrier', href: '/calendar', icon: CalendarDays },
    { name: 'Classements', href: '/standings', icon: BarChart2 },
    { name: 'Résultats', href: '/results', icon: Flag },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 z-50 w-full border-t bg-background shadow-sm md:hidden">
            <div className="flex justify-around items-center h-14">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center text-xs transition-all duration-150 ease-out text-muted-foreground active:scale-95',
                                isActive && 'text-primary font-semibold'
                            )}
                        >
                            <Icon className="h-5 w-5 mb-0.5 transition-transform duration-150 ease-out" />
                            {item.name}
                        </Link>

                    )
                })}
            </div>
        </nav>
    )
}
