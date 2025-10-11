import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal(props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-[rgba(var(--brand),0.40)] backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

export function DialogContent({ className, children, showCloseButton = true, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-lg sm:max-w-2xl",
          "bg-white/55 dark:bg-neutral-900/35 backdrop-blur-xl border-white/30 dark:border-white/10 glass-shadow",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "absolute right-4 top-4 rounded-md p-2 opacity-80 transition-opacity hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.6)]"
            )}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div data-slot="dialog-header" className={cn("mb-4 flex flex-col gap-1", className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div data-slot="dialog-footer" className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-lg font-semibold leading-none", className)} {...props} />
  );
}

export function DialogDescription({ className, children, ...props }) {
  const safeChildren =
    typeof children === "object" && !React.isValidElement(children)
      ? "Invalid description content"
      : children;

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-neutral-600 dark:text-neutral-300", className)}
      {...props}
    >
      {safeChildren}
    </DialogPrimitive.Description>
  );
}
