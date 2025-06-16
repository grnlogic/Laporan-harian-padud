"use client"

import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"

interface ReportData {
  id: string
  date: string
  [key: string]: any
}

interface PDFExportProps {
  data: ReportData
  division: string
  reportType: "single" | "summary"
  className?: string
}

export function PDFExport({ data, division, reportType, className }: PDFExportProps) {
  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("PT. PADUD", pageWidth / 2, 25, { align: "center" })

    doc.setFontSize(16)
    doc.setFont("helvetica", "normal")
    doc.text("LAPORAN HARIAN", pageWidth / 2, 35, { align: "center" })

    doc.setFontSize(14)
    doc.text(`DIVISI ${division.toUpperCase()}`, pageWidth / 2, 45, { align: "center" })

    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 50, pageWidth - 20, 50)

    // Report details
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    doc.text(`Tanggal: ${formatDate(data.date)}`, 20, 65)
    doc.text(`Divisi: ${division}`, 20, 75)
    doc.text(`ID Laporan: ${data.id}`, 20, 85)

    // Content based on division
    const yPosition = 100

    if (division === "Produksi") {
      const tableData = [
        ["Target Produksi Harian", `${data.targetProduction} kg`],
        ["Realisasi Produksi Harian", `${data.actualProduction} kg`],
        ["Pemakaian Bahan Baku", `${data.rawMaterialUsage} kg`],
        ["Barang Cacat/Gagal Produksi", `${data.defectiveProducts} kg`],
        ["Efisiensi Produksi", `${data.efficiency}%`],
      ]

      if (data.productionIssues) {
        tableData.push(["Kendala Produksi", data.productionIssues])
      }
      ;(doc as any).autoTable({
        startY: yPosition,
        head: [["Keterangan", "Nilai"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      })
    } else if (division === "Keuangan") {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount)
      }

      const tableData = [
        ["Kas Masuk Harian", formatCurrency(data.cashInflow)],
        ["Kas Keluar Harian", formatCurrency(data.cashOutflow)],
        ["Pendapatan Bersih", formatCurrency(data.netRevenue)],
        ["Biaya Operasional", formatCurrency(data.operationalCosts)],
        ["Saldo Akhir Kas", formatCurrency(data.cashBalance)],
      ]

      if (data.financialNotes) {
        tableData.push(["Catatan Keuangan", data.financialNotes])
      }
      ;(doc as any).autoTable({
        startY: yPosition,
        head: [["Keterangan", "Nilai"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      })
    } else if (division === "Pemasaran") {
      const tableData = [
        ["Prospek Baru", `${data.newProspects} orang`],
        ["Follow-up Calls", `${data.followUpCalls} calls`],
        ["Deal Tertutup", `${data.closedDeals} deals`],
        ["Tingkat Konversi", `${data.conversionRate}%`],
        [
          "Total Penjualan",
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(data.totalRevenue),
        ],
      ]

      if (data.marketingNotes) {
        tableData.push(["Catatan Pemasaran", data.marketingNotes])
      }
      ;(doc as any).autoTable({
        startY: yPosition,
        head: [["Keterangan", "Nilai"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      })
    } else if (division === "Distribusi & Gudang") {
      const tableData = [
        ["Barang Masuk", `${data.incomingGoods} unit`],
        ["Pengiriman Keluar", `${data.outgoingShipments} unit`],
        ["Level Stok Akhir", `${data.stockLevel} unit`],
        ["Total Paket Dikirim", `${data.totalPackages} paket`],
        ["On-Time Delivery", `${data.onTimeDelivery}%`],
      ]

      if (data.warehouseNotes) {
        tableData.push(["Catatan Gudang", data.warehouseNotes])
      }
      ;(doc as any).autoTable({
        startY: yPosition,
        head: [["Keterangan", "Nilai"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      })
    }

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 100
    doc.setFontSize(10)
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 20, pageHeight - 30)
    doc.text("PT. PADUD - Sistem Laporan Harian", pageWidth - 20, pageHeight - 30, { align: "right" })

    // Save PDF
    doc.save(`Laporan-${division}-${data.date}.pdf`)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    let contentHTML = ""

    if (division === "Produksi") {
      contentHTML = `
        <tr><td><strong>Target Produksi Harian</strong></td><td>${data.targetProduction} kg</td></tr>
        <tr><td><strong>Realisasi Produksi Harian</strong></td><td>${data.actualProduction} kg</td></tr>
        <tr><td><strong>Pemakaian Bahan Baku</strong></td><td>${data.rawMaterialUsage} kg</td></tr>
        <tr><td><strong>Barang Cacat/Gagal Produksi</strong></td><td>${data.defectiveProducts} kg</td></tr>
        <tr><td><strong>Efisiensi Produksi</strong></td><td>${data.efficiency}%</td></tr>
        ${data.productionIssues ? `<tr><td><strong>Kendala Produksi</strong></td><td>${data.productionIssues}</td></tr>` : ""}
      `
    } else if (division === "Keuangan") {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount)
      }

      contentHTML = `
        <tr><td><strong>Kas Masuk Harian</strong></td><td>${formatCurrency(data.cashInflow)}</td></tr>
        <tr><td><strong>Kas Keluar Harian</strong></td><td>${formatCurrency(data.cashOutflow)}</td></tr>
        <tr><td><strong>Pendapatan Bersih</strong></td><td>${formatCurrency(data.netRevenue)}</td></tr>
        <tr><td><strong>Biaya Operasional</strong></td><td>${formatCurrency(data.operationalCosts)}</td></tr>
        <tr><td><strong>Saldo Akhir Kas</strong></td><td>${formatCurrency(data.cashBalance)}</td></tr>
        ${data.financialNotes ? `<tr><td><strong>Catatan Keuangan</strong></td><td>${data.financialNotes}</td></tr>` : ""}
      `
    } else if (division === "Pemasaran") {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(amount)
      }

      contentHTML = `
        <tr><td><strong>Prospek Baru</strong></td><td>${data.newProspects} orang</td></tr>
        <tr><td><strong>Follow-up Calls</strong></td><td>${data.followUpCalls} calls</td></tr>
        <tr><td><strong>Deal Tertutup</strong></td><td>${data.closedDeals} deals</td></tr>
        <tr><td><strong>Tingkat Konversi</strong></td><td>${data.conversionRate}%</td></tr>
        <tr><td><strong>Total Penjualan</strong></td><td>${formatCurrency(data.totalRevenue)}</td></tr>
        ${data.marketingNotes ? `<tr><td><strong>Catatan Pemasaran</strong></td><td>${data.marketingNotes}</td></tr>` : ""}
      `
    } else if (division === "Distribusi & Gudang") {
      contentHTML = `
        <tr><td><strong>Barang Masuk</strong></td><td>${data.incomingGoods} unit</td></tr>
        <tr><td><strong>Pengiriman Keluar</strong></td><td>${data.outgoingShipments} unit</td></tr>
        <tr><td><strong>Level Stok Akhir</strong></td><td>${data.stockLevel} unit</td></tr>
        <tr><td><strong>Total Paket Dikirim</strong></td><td>${data.totalPackages} paket</td></tr>
        <tr><td><strong>On-Time Delivery</strong></td><td>${data.onTimeDelivery}%</td></tr>
        ${data.warehouseNotes ? `<tr><td><strong>Catatan Gudang</strong></td><td>${data.warehouseNotes}</td></tr>` : ""}
      `
    }

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan ${division} - ${formatDate(data.date)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .division-name {
              font-size: 16px;
              color: #3b82f6;
            }
            .report-info {
              margin-bottom: 30px;
            }
            .report-info p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #3b82f6;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 50px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">PT. PADUD</div>
            <div class="report-title">LAPORAN HARIAN</div>
            <div class="division-name">DIVISI ${division.toUpperCase()}</div>
          </div>
          
          <div class="report-info">
            <p><strong>Tanggal:</strong> ${formatDate(data.date)}</p>
            <p><strong>Divisi:</strong> ${division}</p>
            <p><strong>ID Laporan:</strong> ${data.id}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Keterangan</th>
                <th style="width: 60%;">Nilai</th>
              </tr>
            </thead>
            <tbody>
              ${contentHTML}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
            <p>PT. PADUD - Sistem Laporan Harian</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printHTML)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={generatePDF}>
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
    </div>
  )
}
