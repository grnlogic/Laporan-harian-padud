"use client"

import type React from "react"

import { Card, CardContent, CardHeader } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { RefreshCw, Save, FileDown, Printer, Sparkles } from "lucide-react"

interface EnhancedFormCardProps {
  title: string
  children: React.ReactNode
  onClear: () => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  divisionColor?: string
}

export function EnhancedFormCard({
  title,
  children,
  onClear,
  onSubmit,
  isLoading,
  divisionColor = "blue",
}: EnhancedFormCardProps) {
  const colorClasses = {
    blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
    green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
    orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
    purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    red: "border-red-200 bg-gradient-to-br from-red-50 to-red-100",
  }

  const buttonColors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    red: "bg-red-600 hover:bg-red-700",
  }

  return (
    <Card className={`shadow-xl border-2 ${colorClasses[divisionColor as keyof typeof colorClasses]}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <Badge variant="outline" className="mt-1">
                Editor Dinamis
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClear} className="hover:bg-white/80">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {children}

          {/* Enhanced Action Buttons */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              className={`w-full h-12 text-lg font-semibold ${buttonColors[divisionColor as keyof typeof buttonColors]} shadow-lg hover:shadow-xl transition-all duration-200`}
              disabled={isLoading}
            >
              <Save className="h-5 w-5 mr-3" />
              {isLoading ? "Menyimpan..." : "💾 Simpan Laporan"}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" size="lg" className="h-11 hover:bg-gray-50">
                <FileDown className="h-5 w-5 mr-2" />📄 Export PDF
              </Button>
              <Button type="button" variant="outline" size="lg" className="h-11 hover:bg-gray-50">
                <Printer className="h-5 w-5 mr-2" />
                🖨️ Print
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
