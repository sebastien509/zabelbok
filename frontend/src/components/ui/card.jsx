import React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  variant = "default",
  hoverEffect = "none",
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-xl p-6 flex flex-col gap-6 transition-all",
        // Variants
        variant === "default" && "border border-gray-200 dark:border-gray-700 shadow-sm",
        variant === "outline" && "border-2 border-gray-300 dark:border-gray-600",
        variant === "filled" && "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700",
        variant === "elevated" && "shadow-md dark:shadow-gray-800/30",
        // Hover effects
        hoverEffect === "scale" && "hover:scale-[1.02] transition-transform duration-200 ease-in-out",
        hoverEffect === "shadow" && "hover:shadow-md dark:hover:shadow-gray-800/30 transition-shadow duration-200 ease-in-out",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  align = "start",
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 px-0 sm:px-6 pb-0 sm:pb-4 border-b border-gray-100 dark:border-gray-700",
        align === "center" && "items-center text-center",
        align === "end" && "items-end text-right",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({
  className,
  size = "md",
  ...props
}) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-semibold leading-tight",
        size === "sm" && "text-base",
        size === "md" && "text-lg",
        size === "lg" && "text-xl",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({
  className,
  variant = "default",
  ...props
}) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm",
        variant === "default" && "text-gray-600 dark:text-gray-300",
        variant === "secondary" && "text-gray-500 dark:text-gray-400",
        variant === "muted" && "text-gray-400 dark:text-gray-500",
        className
      )}
      {...props}
    />
  )
}

function CardAction({
  className,
  position = "end",
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "self-start mt-1",
        position === "end" && "ml-auto",
        position === "start" && "mr-auto",
        className
      )}
      {...props}
    />
  )
}

function CardContent({
  className,
  padding = "md",
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-0 sm:px-6",
        padding === "none" && "py-0",
        padding === "sm" && "py-2",
        padding === "md" && "py-4",
        padding === "lg" && "py-6",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({
  className,
  sticky = false,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 px-0 sm:px-6",
        sticky && "sticky bottom-0 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-80",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}