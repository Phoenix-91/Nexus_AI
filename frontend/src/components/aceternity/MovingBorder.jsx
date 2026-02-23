import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({ children, className, duration = 3000 }) {
    return (
        <div className={cn("relative p-[2px] rounded-2xl", className)}>
            <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                    background: "linear-gradient(90deg, #8b5cf6, #3b82f6, #8b5cf6)",
                    backgroundSize: "200% 100%",
                }}
                animate={{
                    backgroundPosition: ["0% 0%", "200% 0%"],
                }}
                transition={{
                    duration: duration / 1000,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <div className="relative bg-[#0a0a0a] rounded-2xl">
                {children}
            </div>
        </div>
    );
}
