// ✅ components/ui/scroll-area.jsx
export function ScrollArea({ children, className = '', ...props }) {
    return (
      <div
        className={`overflow-auto rounded border border-gray-200 p-2 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  