import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6 overflow-hidden transition-all duration-300",
        hoverEffect && "hover:-translate-y-1 hover:shadow-glass-lg hover:border-primary/30 dark:hover:border-primary/20 hover:scale-[1.01]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
