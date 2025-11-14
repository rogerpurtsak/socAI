import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-primary/10 text-primary border border-primary/20": variant === "default",
          "border border-border bg-transparent": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}
