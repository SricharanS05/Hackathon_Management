import React from 'react';
import { cn } from '@/utils/cn';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted-foreground/15 dark:bg-muted-foreground/10", className)}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-1/4 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg ml-auto" />
      </div>
      <div className="border border-border rounded-xl overflow-hidden glass-panel p-0">
        <div className="bg-secondary/40 p-4 border-b border-border flex gap-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-20 ml-auto" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0 flex gap-4 items-center">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-7 w-20 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 w-full h-[300px]">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex-1 flex items-end gap-3 mt-4">
        {Array.from({ length: 7 }).map((_, i) => {
          const heights = ["h-[40%]", "h-[65%]", "h-[50%]", "h-[85%]", "h-[30%]", "h-[70%]", "h-[60%]"];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className={cn("w-full rounded-t-lg", heights[i])} />
              <Skeleton className="h-3 w-8" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
