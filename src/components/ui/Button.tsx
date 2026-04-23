import React from 'react';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-surface motion-safe:active:scale-95",
          {
            // Variants
            "bg-primary text-on-primary hover:bg-primary-hover shadow-sm hover:shadow-md": variant === 'primary',
            "bg-muted-bg text-foreground hover:bg-muted/80": variant === 'secondary',
            "border border-muted bg-transparent hover:bg-muted-bg text-foreground": variant === 'outline',
            "bg-transparent hover:bg-muted-bg text-foreground": variant === 'ghost',
            "bg-danger text-white hover:opacity-90": variant === 'danger',
            "bg-success text-white hover:opacity-90": variant === 'success',
          },
          {
            // Sizes
            "h-8 px-3 text-sm": size === 'sm',
            "h-10 py-2 px-4": size === 'md',
            "h-12 px-8 text-lg": size === 'lg',
            "h-10 w-10 p-0 flex items-center justify-center": size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
