import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AuroraBackground({ children, className }) {
    return (
        <div className={cn("relative min-h-screen overflow-hidden bg-[#0a0a0a]", className)}>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0"
                    >
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
                    </motion.div>
                </div>
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
