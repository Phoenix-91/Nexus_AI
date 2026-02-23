import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full glass", className)}
        {...props}
    >
        <div
            className="h-full gradient-purple-blue transition-all duration-500 ease-out"
            style={{ width: `${value}%` }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
