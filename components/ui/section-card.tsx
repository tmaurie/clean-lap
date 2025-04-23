import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type SectionCardProps = {
    title: string
    icon?: React.ReactNode
    actions?: React.ReactNode
    children: React.ReactNode
    className?: string
    variant?: 'default' | 'subtle'
}

export function SectionCard({
                                title,
                                icon,
                                actions,
                                children,
                                className,
                                variant = 'default',
                            }: SectionCardProps) {
    return (
        <Card
            className={cn(
                'h-full',
                variant === 'subtle' && 'bg-muted/40 border-muted',
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    {title}
                </div>
                {actions && <div>{actions}</div>}
            </CardHeader>

            <CardContent className="pt-4">{children}</CardContent>
        </Card>
    )
}
