import * as React from "react"
import { cn } from "@/lib/utils"

export const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default",
  children,
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:opacity-90": variant === "default",
          "border border-border bg-transparent hover:bg-accent/10": variant === "outline",
          "hover:bg-accent/10": variant === "ghost",
          "h-10 px-4 py-2": size === "default",
          "h-8 px-3 text-sm": size === "sm",
          "h-12 px-8": size === "lg",
        },
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"
