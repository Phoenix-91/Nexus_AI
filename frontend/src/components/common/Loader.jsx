import { cn } from "@/lib/utils"

export function Loader({ className, size = "default" }) {
    const sizes = {
        sm: "w-4 h-4 border-2",
        default: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    }

    return (
        <div className="flex items-center justify-center">
            <div
                className={cn(
                    "rounded-full border-purple-500 border-t-transparent animate-spin",
                    sizes[size],
                    className
                )}
            />
        </div>
    )
}

export function LoadingDots() {
    return (
        <div className="flex space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    )
}
