"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/5",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-600 bg-green-50 dark:bg-green-950/20",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
        info: "border-blue-500/50 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-600 bg-blue-50 dark:bg-blue-950/20",
        gradient: "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-800",
        glass: "backdrop-blur-sm bg-white/80 border-white/20 shadow-lg",
      },
      size: {
        sm: "p-3 text-sm",
        default: "p-4",
        lg: "p-6 text-lg",
      },
      animation: {
        none: "",
        slide: "animate-in slide-in-from-top-2",
        fade: "animate-in fade-in-0",
        bounce: "animate-in slide-in-from-top-2 duration-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "slide",
    },
  },
)

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  autoClose?: number
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, animation, dismissible, onDismiss, icon, autoClose, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      if (autoClose && autoClose > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          if (onDismiss) {
            setTimeout(onDismiss, 200)
          }
        }, autoClose)

        return () => clearTimeout(timer)
      }
    }, [autoClose, onDismiss])

    const getDefaultIcon = () => {
      switch (variant) {
        case "destructive":
          return <XCircle className="h-4 w-4" />
        case "success":
          return <CheckCircle className="h-4 w-4" />
        case "warning":
          return <AlertTriangle className="h-4 w-4" />
        case "info":
          return <Info className="h-4 w-4" />
        default:
          return <Info className="h-4 w-4" />
      }
    }

    const handleDismiss = () => {
      setIsVisible(false)
      if (onDismiss) {
        setTimeout(onDismiss, 200)
      }
    }

    if (!isVisible) {
      return null
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          alertVariants({ variant, size, animation }),
          !isVisible && "animate-out fade-out-0 slide-out-to-top-2",
          className,
        )}
        {...props}
      >
        {icon || getDefaultIcon()}
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  },
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  ),
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  ),
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription, alertVariants }
