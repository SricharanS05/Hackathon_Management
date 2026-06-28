import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 dark:text-muted-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "glass-input px-4 py-2.5 text-sm w-full bg-white/40 dark:bg-black/20 border-border placeholder:text-muted-foreground/50 text-foreground",
            error && "border-rose-500/50 dark:border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <span className="text-xs font-semibold text-rose-500">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-muted-foreground">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
