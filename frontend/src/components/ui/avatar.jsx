import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Avatar = React.forwardRef(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      xs: "size-6",
      sm: "size-8",
      md: "size-10",
      lg: "size-12",
      xl: "size-16"
    }

    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 transition-all hover:ring-2 hover:ring-primary/50",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)

const AvatarImage = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AvatarPrimitive.Image
          ref={ref}
          data-slot="avatar-image"
          className={cn(
            "aspect-square h-full w-full object-cover transition-opacity duration-300",
            className
          )}
          {...props}
        />
      </motion.div>
    )
  }
)

const AvatarFallback = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700",
          className
        )}
        {...props}
      >
        {children || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-2/3 w-2/3 text-gray-500 dark:text-gray-400"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </AvatarPrimitive.Fallback>
    )
  }
)

Avatar.displayName = AvatarPrimitive.Root.displayName
AvatarImage.displayName = AvatarPrimitive.Image.displayName
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }