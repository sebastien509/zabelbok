// src/components/ui/skeleton.jsx
export function Skeleton({ className = '', ...props }) {
    return (
      <div
        className={`animate-pulse bg-gray-300 rounded ${className}`}
        {...props}
      />
    );
  }
  