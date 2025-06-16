"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FormRow {
  id: string
  description: string
  amount: number
}

interface EnhancedDynamicFormProps {
  title: string
  subtitle: string
  buttonText: string
  rows: FormRow[]
  onRowsChange: (rows: FormRow[]) => void
  currency?: boolean
  unit?: string
  className?: string
  sectionColor?: string
}

export function EnhancedDynamicForm({
  title,
  subtitle,
  buttonText,
  rows,
  onRowsChange,
  currency = true,
  unit = "",
  className = "",
  sectionColor = "blue",
}: EnhancedDynamicFormProps) {
  const addRow = () => {
    const newRow: FormRow = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
    }
    onRowsChange([...rows, newRow])
  }

  const removeRow = (id: string) => {
    onRowsChange(rows.filter((row) => row.id !== id))
  }

  const updateRow = (id: string, field: keyof FormRow, value: string | number) => {
    onRowsChange(
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "amount" ? (typeof value === "string" ? Number.parseFloat(value) || 0 : value) : value,
            }
          : row,
      ),
    )
  }

  const total = rows.reduce((sum, row) => sum + (row.amount || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (amount: number) => {
    return amount.toLocaleString("id-ID")
  }

  const colorClasses = {
    blue: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100",
    green: "border-green-300 bg-green-50 text-green-700 hover:bg-green-100",
    orange: "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100",
    purple: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100",
    red: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  }

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
              {title}
            </CardTitle>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <Badge variant="outline" className="text-xs">
            {rows.length} item{rows.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enhanced Add Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          className={`w-full border-dashed border-2 h-12 ${colorClasses[sectionColor as keyof typeof colorClasses]} transition-all duration-200 hover:scale-[1.02]`}
        >
          <Plus className="h-5 w-5 mr-2" />
          {buttonText}
        </Button>

        {/* Enhanced Dynamic Rows */}
        {rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.id} className="group relative">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                  {/* Drag Handle */}
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* Row Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>

                  {/* Description Input */}
                  <div className="flex-1">
                    <Label htmlFor={`desc-${row.id}`} className="text-xs text-gray-500 font-medium">
                      Keterangan
                    </Label>
                    <Input
                      id={`desc-${row.id}`}
                      type="text"
                      placeholder="Masukkan keterangan..."
                      value={row.description}
                      onChange={(e) => updateRow(row.id, "description", e.target.value)}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Amount Input */}
                  <div className="w-36">
                    <Label htmlFor={`amount-${row.id}`} className="text-xs text-gray-500 font-medium">
                      {currency ? "Jumlah (Rp)" : `Jumlah${unit ? ` (${unit})` : ""}`}
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id={`amount-${row.id}`}
                        type="number"
                        placeholder="0"
                        value={row.amount || ""}
                        onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-8"
                      />
                      <Calculator className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Enhanced Total */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-dashed border-blue-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calculator className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total {title}:</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {currency ? formatCurrency(total) : `${formatNumber(total)}${unit ? ` ${unit}` : ""}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rows.length} item{rows.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Belum ada data</p>
            <p className="text-sm text-gray-400 mt-1">Klik tombol di atas untuk menambah rincian</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
