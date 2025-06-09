import React from 'react';
import { cn } from '@/lib/utils';

export const Table = React.forwardRef(({ className, striped = false, hover = true, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm border-collapse",
        striped && "[&_tbody_tr:nth-child(odd)]:bg-gray-50 dark:[&_tbody_tr:nth-child(odd)]:bg-gray-800/30",
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef(({ className, sticky = false, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "[&_tr]:border-b",
      sticky && "sticky top-0 bg-white dark:bg-gray-900 z-10",
      className
    )} 
    {...props} 
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef(({ className, loading = false, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      loading && "opacity-50",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef(({ className, sticky = false, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-50 dark:bg-gray-800/50 font-medium [&>tr]:last:border-b-0",
      sticky && "sticky bottom-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef(({ className, selected = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors",
      "hover:bg-gray-100 dark:hover:bg-gray-800/50",
      selected && "bg-gray-100 dark:bg-gray-800",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef(({ className, align = 'left', ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 align-middle font-medium text-gray-500 dark:text-gray-400 [&:has([role=checkbox])]:pr-0",
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef(({ className, align = 'left', ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      align === 'left' && 'text-left',
      align === 'center' && 'text-center',
      align === 'right' && 'text-right',
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef(({ className, position = 'bottom', ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "text-sm text-gray-500 dark:text-gray-400",
      position === 'top' && 'mb-4',
      position === 'bottom' && 'mt-4',
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Default export with all components for convenience
const TableComponents = {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

export default TableComponents;