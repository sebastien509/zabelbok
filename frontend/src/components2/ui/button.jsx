import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Color tokens (kept literal so you're not dependent on Tailwind theme vars)
 * - Orange (brand): #EA7125
 * - Tech Blue: #2C365E
 * - Apple Green: #66A569 (matches your theme_color vibe)
 * - Red: use tailwind red-500 family
 */

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none " +
  "focus-visible:ring-[3px] focus-visible:ring-offset-0 " +
  "active:translate-y-[1px] " +
  // ✅ shadow for ALL buttons
  "shadow-[0_10px_30px_rgba(0,0,0,0.10)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.14)]"

const buttonVariants = cva(base, {
  variants: {
    variant: {
      // ✅ BRAND ORANGE (base default)
      default:
        "text-white " +
        "bg-[#EA7125] hover:bg-[#EA7125]/90 " +
        "focus-visible:ring-[#EA7125]/25",

      // ✅ TECH BLUE (secondary actions)
      secondary:
        "text-white " +
        "bg-[#2C365E] hover:bg-[#2C365E]/92 " +
        "focus-visible:ring-[#2C365E]/25",

      // ✅ APPLE GREEN (success)
      success:
        "text-white " +
        "bg-[#66A569] hover:bg-[#66A569]/92 " +
        "focus-visible:ring-[#66A569]/25",

      // ✅ RED (danger)
      destructive:
        "text-white " +
        "bg-red-500/90 hover:bg-red-500 " +
        "focus-visible:ring-red-500/25",

      // ✅ OUTLINE but NEVER WHITE (tinted glass)
      outline:
        "text-[#2C365E] " +
        "border border-white/20 " +
        "bg-[#2C365E]/[0.06] hover:bg-[#2C365E]/[0.10] " +
        "backdrop-blur-md " +
        "focus-visible:ring-[#2C365E]/20",

      // ✅ GHOST but NEVER TRANSPARENT/WHITE (subtle tinted)
      ghost:
        "text-[#2C365E] " +
        "bg-[#2C365E]/[0.05] hover:bg-[#2C365E]/[0.09] " +
        "backdrop-blur-md " +
        "focus-visible:ring-[#2C365E]/20",

      // ✅ LINK (still not white—no bg needed)
      link:
        "text-[#EA7125] underline-offset-4 hover:underline " +
        "shadow-none hover:shadow-none",
    },

    size: {
      default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
      sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
      lg: "h-11 rounded-xl px-7 has-[>svg]:px-5 text-[15px]",
      icon: "size-10 rounded-xl",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
