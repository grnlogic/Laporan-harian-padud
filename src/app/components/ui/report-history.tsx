"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { ChevronDown, ChevronUp, Eye, FileDown, Printer, Edit, Trash2 } from "lucide-react"

interface ReportHistoryProps {
  reports: any[]
  onView?: (report: any) => void
  onEdit?: (report: any) => void
  onDelete?: (report: any) => void
  onExport?: (report: any) => void
  className?: string
}

export function ReportHistory({ reports, onView, onEdit, onDelete, onExport, className = "" }: ReportHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getReportSummary = (report: any) => {
    if (!report.data) return "Data tidak tersedia"

    // For finance reports
    if (report.division === "Keuangan & Administrasi") {
      const kasReceivable = report.data.kasReceivable || []
      const kasPayable = report.data.kasPayable || []
      const totalIn = kasReceivable.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      const totalOut = kasPayable.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      return `Masuk: ${formatCurrency(totalIn)} | Keluar: ${formatCurrency(totalOut)}`
    }

    return "Laporan tersimpan"
  }

  const getStatusBadge = (report: any) => {
    const now = new Date()
    const reportDate = new Date(report.date)
    const diffDays = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return <Badge className="bg-green-500">Hari Ini</Badge>
    if (diffDays === 1) return <Badge className="bg-blue-500">Kemarin</Badge>
    if (diffDays <= 7) return <Badge variant="outline">{diffDays} hari lalu</Badge>
    return <Badge variant="secondary">{diffDays} hari lalu</Badge>
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Riwayat Laporan</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
          >
            <span className="text-sm text-gray-600">{reports.length} laporan</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada laporan yang disimpan</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Ringkasan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{formatDate(report.date)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm text-gray-600">{getReportSummary(report)}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {onView && (
                            <Button variant="ghost" size="sm" onClick={() => onView(report)} title="Lihat">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button variant="ghost" size="sm" onClick={() => onEdit(report)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onExport && (
                            <Button variant="ghost" size="sm" onClick={() => onExport(report)} title="Export PDF">
                              <FileDown className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title="Print">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(report)}
                              className="text-red-600 hover:text-red-700"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
