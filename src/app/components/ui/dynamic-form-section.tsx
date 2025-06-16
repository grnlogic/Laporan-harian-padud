"use client"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface FormRow {
  id: string
  description: string
  amount: number
}

interface DynamicFormSectionProps {
  title: string
  subtitle: string
  buttonText: string
  rows: FormRow[]
  onRowsChange: (rows: FormRow[]) => void
  currency?: boolean
  unit?: string
  className?: string
}

export function DynamicFormSection({
  title,
  subtitle,
  buttonText,
  rows,
  onRowsChange,
  currency = true,
  unit = "",
  className = "",
}: DynamicFormSectionProps) {
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

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>

        {/* Dynamic Rows */}
        {rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={`desc-${row.id}`} className="text-xs text-gray-500">
                    Keterangan
                  </Label>
                  <Input
                    id={`desc-${row.id}`}
                    type="text"
                    placeholder="Masukkan keterangan"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, "description", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`amount-${row.id}`} className="text-xs text-gray-500">
                    {currency ? "Jumlah (Rp)" : `Jumlah${unit ? ` (${unit})` : ""}`}
                  </Label>
                  <Input
                    id={`amount-${row.id}`}
                    type="number"
                    placeholder="0"
                    value={row.amount || ""}
                    onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRow(row.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-end pt-3 border-t border-gray-200">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total {title}:</p>
                <p className="text-lg font-bold text-gray-900">
                  {currency ? formatCurrency(total) : `${formatNumber(total)}${unit ? ` ${unit}` : ""}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {rows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Belum ada data. Klik tombol di atas untuk menambah rincian.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
