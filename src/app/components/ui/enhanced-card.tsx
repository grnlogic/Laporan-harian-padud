"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-lg border bg-card text-card-foreground transition-all duration-200", {
  variants: {
    variant: {
      default: "shadow-sm hover:shadow-md",
      elevated: "shadow-md hover:shadow-lg",
      floating: "shadow-lg hover:shadow-xl",
      gradient: "bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg",
      glass: "backdrop-blur-sm bg-white/80 border-white/20 shadow-lg",
      neon: "border-2 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      default: "p-6",
      lg: "p-8",
    },
    animation: {
      none: "",
      hover: "hover:scale-[1.02]",
      float: "hover:-translate-y-1",
      glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
    animation: "hover",
  },
})

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const EnhancedCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, animation, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, animation }), className)} {...props} />
  ),
)
EnhancedCard.displayName = "EnhancedCard"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { EnhancedCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
