import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <select
            className={cn(
                "flex h-11 w-full rounded-xl glass px-4 py-2 text-sm text-white",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-all duration-200 cursor-pointer",
                "bg-[length:16px_16px] bg-[right_1rem_center] bg-no-repeat",
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </select>
    )
})
Select.displayName = "Select"

export { Select }
