import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
        default: "gradient-purple-blue text-white hover:opacity-90",
        outline: "glass border-2 border-purple-500 text-white hover:bg-purple-500/20",
        ghost: "hover:bg-white/10 text-white",
    }

    const sizes = {
        default: "h-11 px-8 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-10 text-lg",
        icon: "h-11 w-11",
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
