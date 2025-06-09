import React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Checkbox({
  className,
  variant = "default",
  size = "md",
  disabled = false,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      disabled={disabled}
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        // Variants
        variant === "default" && "bg-white dark:bg-gray-800",
        variant === "outline" && "bg-transparent border-2",
        variant === "filled" && "bg-gray-100 dark:bg-gray-700",
        // Sizes
        size === "sm" && "size-3",
        size === "md" && "size-4",
        size === "lg" && "size-5",
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none">
        <CheckIcon className={cn(
          size === "sm" && "size-2.5",
          size === "md" && "size-3.5",
          size === "lg" && "size-4"
        )} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }