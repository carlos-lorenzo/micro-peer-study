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
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
            // Variants
            "bg-blue-600 text-white hover:bg-blue-700": variant === 'primary',
            "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === 'secondary',
            "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700": variant === 'outline',
            "bg-transparent hover:bg-gray-100 text-gray-700": variant === 'ghost',
            "bg-red-600 text-white hover:bg-red-700": variant === 'danger',
            "bg-green-600 text-white hover:bg-green-700": variant === 'success',
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
