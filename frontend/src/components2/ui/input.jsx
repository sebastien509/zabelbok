import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: lighter, cleaner, more premium
        "flex h-10 w-full min-w-0 rounded-xl px-3.5 py-2 text-sm",
        "bg-white/70 dark:bg-zinc-950/40",
        "text-zinc-900 dark:text-zinc-100",
        "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
        "border border-zinc-200/80 dark:border-white/10",
        "shadow-sm",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "outline-none",

        // Focus: subtle “tech glow” but still light
        "focus-visible:border-cyan-300/70 dark:focus-visible:border-cyan-300/40",
        "focus-visible:ring-4 focus-visible:ring-cyan-200/40 dark:focus-visible:ring-cyan-400/10",

        // Selection
        "selection:bg-cyan-200/60 selection:text-zinc-900",

        // File input niceness
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "file:text-zinc-700 dark:file:text-zinc-200",

        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        // Invalid: still obvious, not harsh
        "aria-invalid:border-destructive/70",
        "aria-invalid:ring-4 aria-invalid:ring-destructive/10",

        className
      )}
      {...props}
    />
  )
}

export { Input }
