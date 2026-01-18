'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      success: 'bg-success/15 text-success border-success/30',
      warning: 'bg-warning/15 text-warning-foreground border-warning/30',
      destructive: 'bg-destructive/15 text-destructive border-destructive/30',
      outline: 'bg-transparent border-border text-foreground',
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium border",
          "transition-colors duration-200",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
