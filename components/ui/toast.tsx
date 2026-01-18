'use client'

import * as React from "react"
import { CheckCircle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"

export function Toast() {
  const { notification, clearNotification } = useAppStore()
  const [isVisible, setIsVisible] = React.useState(false)
  
  React.useEffect(() => {
    if (notification) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(clearNotification, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, clearNotification])
  
  if (!notification) return null
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-destructive" />,
    info: <Info className="w-5 h-5 text-primary" />,
  }
  
  const bgColors = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-destructive/10 border-destructive/20',
    info: 'bg-primary/10 border-primary/20',
  }
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg",
          "transition-all duration-300 ease-out",
          bgColors[notification.type],
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        {icons[notification.type]}
        <span className="text-sm font-medium">{notification.message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(clearNotification, 300)
          }}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
