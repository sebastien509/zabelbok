import { toast as hotToast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react';

const toastVariants = {
  success: {
    styles: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    icon: <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
  },
  error: {
    styles: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    icon: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
  },
  info: {
    styles: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    icon: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
  },
  loading: {
    styles: 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    icon: <Loader2 className="h-5 w-5 text-gray-500 dark:text-gray-400 animate-spin" />
  },
  warning: {
    styles: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    icon: <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
  }
};

export function useToast() {
  function toast({ 
    title, 
    description = '', 
    variant = 'info',
    duration = 5000,
    position = 'top-right',
    action,
    dismissible = true
  }) {
    hotToast.custom((t) => (
      <div
        className={`${toastVariants[variant]?.styles || toastVariants.info.styles} flex items-start w-full max-w-md p-4 rounded-lg border shadow-lg transition-all duration-300 ${t.visible ? 'animate-in fade-in' : 'animate-out fade-out'}`}
      >
        <div className="mr-3 mt-0.5">
          {toastVariants[variant]?.icon || toastVariants.info.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
          {action && (
            <div className="mt-2">
              {action}
            </div>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="ml-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    ), { duration, position });
  }

  // Convenience methods
  toast.success = (title, description, options) => 
    toast({ title, description, variant: 'success', ...options });

  toast.error = (title, description, options) => 
    toast({ title, description, variant: 'error', ...options });

  toast.info = (title, description, options) => 
    toast({ title, description, variant: 'info', ...options });

  toast.loading = (title, description, options) => 
    toast({ title, description, variant: 'loading', ...options });

  toast.warning = (title, description, options) => 
    toast({ title, description, variant: 'warning', ...options });

  return toast;
}

export const toast = useToast();
export default useToast;