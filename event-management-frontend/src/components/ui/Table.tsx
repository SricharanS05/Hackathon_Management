import React from 'react';
import { cn } from '@/utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border glass-panel p-0">
      <table className={cn("w-full text-sm text-left border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => {
  return (
    <thead className={cn("bg-secondary/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground", className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, children, ...props }) => {
  return (
    <tbody className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, children, ...props }) => {
  return (
    <tr className={cn("hover:bg-secondary/20 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => {
  return (
    <th className={cn("px-6 py-4 font-bold text-foreground/80 dark:text-foreground/75", className)} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => {
  return (
    <td className={cn("px-6 py-4 text-foreground/90 font-medium", className)} {...props}>
      {children}
    </td>
  );
};
