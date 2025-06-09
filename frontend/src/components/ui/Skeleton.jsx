import React from "react"
import { cn } from "@/lib/utils"

const Skeleton = ({
  className,
  variant = 'default',
  rounded = 'md',
  ...props
}) => (
  <div
    className={cn(
      "animate-pulse bg-gray-200 dark:bg-gray-700",
      // Variants
      variant === 'default' && "bg-gray-200 dark:bg-gray-700",
      variant === 'light' && "bg-gray-100 dark:bg-gray-800",
      // Rounded options
      rounded === 'none' && "rounded-none",
      rounded === 'sm' && "rounded-sm",
      rounded === 'md' && "rounded-md",
      rounded === 'lg' && "rounded-lg",
      rounded === 'full' && "rounded-full",
      className
    )}
    {...props}
  />
)

const SkeletonContainer = ({ 
  className,
  direction = 'vertical',
  spacing = 'md',
  children,
  ...props 
}) => (
  <div 
    className={cn(
      direction === 'vertical' && 'space-y-4',
      direction === 'horizontal' && 'flex space-x-4',
      spacing === 'sm' && 'gap-2',
      spacing === 'md' && 'gap-4',
      spacing === 'lg' && 'gap-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

// Specialized skeleton components
const SkeletonText = ({ lines = 1, className, ...props }) => {
  if (lines === 1) {
    return <Skeleton className={cn("h-4 w-full", className)} {...props} />
  }
  
  return (
    <SkeletonContainer direction="vertical" spacing="sm">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4 w-full", i === lines - 1 ? "w-3/4" : "w-full", className)} {...props} />
      ))}
    </SkeletonContainer>
  )
}

const SkeletonAvatar = ({ size = 'md', className, ...props }) => (
  <Skeleton
    className={cn(
      "rounded-full",
      size === 'sm' && "h-8 w-8",
      size === 'md' && "h-10 w-10",
      size === 'lg' && "h-12 w-12",
      className
    )}
    {...props}
  />
)

export { 
  Skeleton, 
  SkeletonContainer, 
  SkeletonText, 
  SkeletonAvatar 
}