'use client'

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [shouldRender, setShouldRender] = React.useState(false)
  
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])
  
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])
  
  if (!shouldRender) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          "relative w-full max-w-lg bg-card rounded-xl shadow-lg border",
          "transition-all duration-200 ease-out",
          isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2",
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )
}
