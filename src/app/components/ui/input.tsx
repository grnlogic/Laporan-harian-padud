"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, X } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "h-10 px-3 py-2",
        filled: "h-10 px-3 py-2 bg-gray-50 border-gray-200 focus:bg-white",
        outlined: "h-10 px-3 py-2 border-2 focus:border-blue-500",
        underlined: "h-10 px-0 py-2 border-0 border-b-2 border-gray-200 rounded-none focus:border-blue-500",
        floating: "h-12 px-3 pt-4 pb-2 border-2 focus:border-blue-500",
      },
      inputSize: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
      state: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500",
        warning: "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
      state: "default",
    },
  },
)

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  label?: string
  helperText?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      state,
      type,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      label,
      helperText,
      error,
      value,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const isPassword = type === "password"
    const hasValue = value && value.toString().length > 0
    const actualState = error ? "error" : state

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors",
              actualState === "error" ? "text-red-600" : "text-gray-700",
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{leftIcon}</div>
          )}

          <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={cn(
              inputVariants({ variant, inputSize, state: actualState }),
              leftIcon && "pl-10",
              (rightIcon || clearable || isPassword) && "pr-10",
              className,
            )}
            ref={ref}
            value={value}
            {...props}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {clearable && hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}

            {rightIcon && !clearable && !isPassword && <div className="text-gray-400">{rightIcon}</div>}
          </div>
        </div>

        {(helperText || error) && (
          <p className={cn("mt-1 text-xs", error ? "text-red-600" : "text-gray-500")}>{error || helperText}</p>
        )}
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input, inputVariants }
