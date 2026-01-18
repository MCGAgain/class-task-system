import * as React from "react"
import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin",
        className
      )} 
    />
  )
}

export function LoadingOverlay({ message = "加载中..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner className="w-8 h-8" />
    </div>
  )
}
