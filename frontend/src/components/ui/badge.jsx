import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-all whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        premium:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

const Badge = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"

    return (
      <motion.span
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Comp
          ref={ref}
          data-slot="badge"
          className={cn(badgeVariants({ variant, size }), className)}
          {...props}
        />
      </motion.span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }