import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-text group-[.toaster]:border-accent/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text/70",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-text/10 group-[.toast]:text-text",
          success: "group-[.toast]:border-positive/30 group-[.toast]:text-positive",
          error: "group-[.toast]:border-red-500/30 group-[.toast]:text-red-500",
          warning: "group-[.toast]:border-yellow-500/30 group-[.toast]:text-yellow-500",
          info: "group-[.toast]:border-accent/30 group-[.toast]:text-accent",
        },
      }}
      {...props}
    />
  );
};

export const toast = sonnerToast;

export { Toaster };