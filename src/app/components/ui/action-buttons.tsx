"use client"

import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Share2 } from "lucide-react"
import { PDFExport } from "./pdf-export"

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPrint?: () => void
  onExport?: () => void
  onShare?: () => void
  reportData?: any
  division?: string
  variant?: "default" | "compact"
  className?: string
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onPrint,
  onExport,
  onShare,
  reportData,
  division,
  variant = "default",
  className = "",
}: ActionButtonsProps) {
  const buttonSize = variant === "compact" ? "sm" : "default"
  const iconSize = variant === "compact" ? "h-4 w-4" : "h-5 w-5"

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {onView && (
        <Button variant="outline" size={buttonSize} onClick={onView} title="Lihat Detail">
          <Eye className={iconSize} />
          {variant === "default" && <span className="ml-2">Lihat</span>}
        </Button>
      )}

      {onEdit && (
        <Button variant="outline" size={buttonSize} onClick={onEdit} title="Edit Laporan">
          <Edit className={iconSize} />
          {variant === "default" && <span className="ml-2">Edit</span>}
        </Button>
      )}

      {reportData && division && (
        <PDFExport data={reportData} division={division} reportType="single" className="contents" />
      )}

      {onShare && (
        <Button variant="outline" size={buttonSize} onClick={onShare} title="Bagikan">
          <Share2 className={iconSize} />
          {variant === "default" && <span className="ml-2">Bagikan</span>}
        </Button>
      )}

      {onDelete && (
        <Button variant="destructive" size={buttonSize} onClick={onDelete} title="Hapus">
          <Trash2 className={iconSize} />
          {variant === "default" && <span className="ml-2">Hapus</span>}
        </Button>
      )}
    </div>
  )
}
