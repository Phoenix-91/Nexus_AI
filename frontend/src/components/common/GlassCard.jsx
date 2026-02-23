import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function GlassCard({ children, className, hover = false, ...props }) {
    return (
        <Card
            className={cn(
                "p-6",
                hover && "glass-hover cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
        </Card>
    )
}
