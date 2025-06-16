"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"

interface StatusBadgeProps {
  status: "completed" | "pending" | "late" | "excellent" | "good" | "fair" | "poor" | "optimal" | "moderate" | "low"
  value?: number
  label?: string
  showIcon?: boolean
  className?: string
}

export function StatusBadge({ status, value, label, showIcon = true, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
          icon: CheckCircle,
          text: label || "Selesai",
        }
      case "pending":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
          icon: Clock,
          text: label || "Pending",
        }
      case "late":
        return {
          variant: "destructive" as const,
          className: "",
          icon: AlertTriangle,
          text: label || "Terlambat",
        }
      case "excellent":
        return {
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
          icon: CheckCircle,
          text: label || "Excellent",
        }
      case "good":
        return {
          variant: "default" as const,
          className: "bg-blue-500 hover:bg-blue-600",
          icon: CheckCircle,
          text: label || "Good",
        }
      case "fair":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
          icon: Clock,
          text: label || "Fair",
        }
      case "poor":
        return {
          variant: "destructive" as const,
          className: "",
          icon: XCircle,
          text: label || "Poor",
        }
      case "optimal":
        return {
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600",
          icon: CheckCircle,
          text: label || "Optimal",
        }
      case "moderate":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
          icon: Clock,
          text: label || "Moderate",
        }
      case "low":
        return {
          variant: "destructive" as const,
          className: "",
          icon: AlertTriangle,
          text: label || "Low",
        }
      default:
        return {
          variant: "secondary" as const,
          className: "",
          icon: Clock,
          text: label || "Unknown",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.text}
      {value && <span className="ml-1">({value}%)</span>}
    </Badge>
  )
}
