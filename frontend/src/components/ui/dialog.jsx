import React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ 
  className,
  blur = true,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        blur && "backdrop-blur-sm",
        className
      )}
      {...props} />
  )
}

function DialogContent({
  className,
  size = "default",
  children,
  ...props
}) {
  const hasTitle =
    React.Children.toArray(children).some(
      (child) =>
        child?.type?.displayName === 'DialogTitle' ||
        child?.type?.name === 'DialogTitle'
    );

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-white/80 dark:bg-gray-900/80 overflow-scroll data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg duration-200",
          // Sizes
          size === "sm" && "max-w-[400px]",
          size === "default" && "max-w-[600px]",
          size === "lg" && "max-w-[800px]",
          size === "xl" && "max-w-[1140px]",
          size === "full" && "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
          className
        )}
        {...props}
      >
        {!hasTitle && (
          <DialogTitle className="sr-only">Dialog</DialogTitle>
        )}

        {children}

        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <XIcon className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}


function DialogHeader({
  className,
  align = "start",
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2",
        align === "center" && "text-center items-center",
        align === "end" && "text-right items-end",
        align === "start" && "text-left items-start",
        className
      )}
      {...props} />
  )
}

function DialogFooter({
  className,
  align = "end",
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        align === "start" && "justify-start",
        align === "between" && "justify-between",
        className
      )}
      {...props} />
  )
}

function DialogTitle({
  className,
  size = "md",
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-semibold leading-none",
        size === "sm" && "text-md",
        size === "md" && "text-lg",
        size === "lg" && "text-xl",
        className
      )}
      {...props} />
  )
}

function DialogDescription({
  className,
  variant = "default",
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm",
        variant === "default" && "text-gray-600 dark:text-gray-300",
        variant === "secondary" && "text-gray-500 dark:text-gray-400",
        className
      )}
      {...props} />
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