import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength = 200, showCount = true, value, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(0)
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length)
      onChange?.(e)
    }
    
    React.useEffect(() => {
      if (typeof value === 'string') {
        setCount(value.length)
      }
    }, [value])
    
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm",
            "transition-all duration-300 ease-out resize-none",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "scrollbar-thin",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showCount && (
          <div className={cn(
            "absolute bottom-2 right-3 text-xs transition-colors duration-200",
            count >= maxLength ? "text-destructive" : "text-muted-foreground"
          )}>
            {count}/{maxLength}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
