import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Base positioning + animation
        "fixed inset-0 z-50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        // Tech overlay look
        "bg-black/55 backdrop-blur-md",
        // Subtle gradient wash
        "bg-gradient-to-b from-black/70 via-black/55 to-black/75",
        // Glow vignette + faint grid-ish sheen
        "after:pointer-events-none after:absolute after:inset-0",
        "after:bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.16),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.12),transparent_55%)]",
        // Optional: light “scanline” effect
        "before:pointer-events-none before:absolute before:inset-0",
        "before:opacity-[0.08] before:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.55)_1px,transparent_1px)] before:bg-[length:100%_14px]",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Layout + animation
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2",
          // Tech “glass” panel
          "rounded-2xl border border-white/10",
          "bg-white/85 text-zinc-900 shadow-2xl backdrop-blur-xl",
          "dark:bg-zinc-950/70 dark:text-zinc-50 dark:border-white/10",
          // Neon ring + depth
          "ring-1 ring-emerald-500/10 dark:ring-cyan-400/10",
          // Top scanline highlight
          "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px",
          "after:bg-gradient-to-r after:from-transparent after:via-cyan-300/60 after:to-transparent",
          // Inner glow corners
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
          "before:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_40px_rgba(16,185,129,0.06)]",
          // Padding
          "p-6",
          className
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full",
              "border border-white/10 bg-white/70 text-zinc-700 shadow-sm backdrop-blur",
              "transition hover:bg-white/90 hover:text-zinc-900",
              "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent",
              "dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:bg-zinc-900/90 dark:hover:text-white",
              "disabled:pointer-events-none"
            )}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({ className, children, ...props }) {
  let safeChildren = children

  if (typeof children === "object" && !React.isValidElement(children)) {
    safeChildren = "Invalid description content"
    console.warn("DialogDescription received invalid children:", children)
  }

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-zinc-600 dark:text-zinc-300/80",
        className
      )}
      {...props}
    >
      {safeChildren}
    </DialogPrimitive.Description>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
