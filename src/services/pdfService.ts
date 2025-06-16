import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LaporanHarianResponse } from "@/types/api";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PDFExportData {
  division: string;
  date: string;
  data: any;
  userName?: string;
}

class PDFService {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private formatNumber(amount: number): string {
    return new Intl.NumberFormat("id-ID").format(amount);
  }

  exportToPDF(exportData: PDFExportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PT. PADUD JAYA", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text(
      `LAPORAN HARIAN ${exportData.division.toUpperCase()}`,
      pageWidth / 2,
      45,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const formattedDate = new Date(exportData.date).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    doc.text(`Tanggal: ${formattedDate}`, pageWidth / 2, 60, {
      align: "center",
    });

    if (exportData.userName) {
      doc.text(`Dibuat oleh: ${exportData.userName}`, pageWidth / 2, 75, {
        align: "center",
      });
    }

    let yPosition = 90;

    // Generate content based on division
    switch (exportData.division) {
      case "Produksi":
        yPosition = this.generateProductionPDF(doc, exportData.data, yPosition);
        break;
      case "Pemasaran":
        yPosition = this.generateMarketingPDF(doc, exportData.data, yPosition);
        break;
      case "Keuangan":
        yPosition = this.generateFinancePDF(doc, exportData.data, yPosition);
        break;
      case "HRD":
        yPosition = this.generateHRDPDF(doc, exportData.data, yPosition);
        break;
      case "Gudang":
        yPosition = this.generateWarehousePDF(doc, exportData.data, yPosition);
        break;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleDateString(
        "id-ID"
      )} ${new Date().toLocaleTimeString("id-ID")}`,
      margin,
      pageHeight - 20
    );

    // Save the PDF
    const fileName = `Laporan_${exportData.division}_${
      new Date(exportData.date).toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  }

  exportReportToPDF(report: LaporanHarianResponse): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PT. PADUD JAYA", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text(`LAPORAN HARIAN ${report.divisi}`, pageWidth / 2, 45, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const formattedDate = new Date(report.tanggalLaporan).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    doc.text(`Tanggal: ${formattedDate}`, pageWidth / 2, 60, {
      align: "center",
    });

    // Fix untuk userName yang undefined
    const userName = report.namaUser || "Admin";
    doc.text(`Dibuat oleh: ${userName}`, pageWidth / 2, 75, {
      align: "center",
    });

    let yPos = 90;

    // Group rincian by kategoriUtama
    const groupedRincian = report.rincian.reduce((acc, item) => {
      const key = item.kategoriUtama;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    // Generate sections
    Object.entries(groupedRincian).forEach(([kategori, items]) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(kategori.replace(/_/g, " "), 20, yPos);
      yPos += 15;

      const tableData = items.map((item) => [
        item.keterangan,
        item.nilaiKuantitas
          ? `${this.formatNumber(item.nilaiKuantitas)} ${item.satuan || ""}`
          : "-",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Keterangan", "Jumlah"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 220, 220] },
        margin: { left: 20, right: 20 },
      });

      yPos = doc.lastAutoTable.finalY + 15;
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(
      `Dicetak pada: ${new Date().toLocaleDateString(
        "id-ID"
      )} ${new Date().toLocaleTimeString("id-ID")}`,
      20,
      pageHeight - 20
    );

    // Save
    const fileName = `Laporan_${report.divisi}_${
      new Date(report.tanggalLaporan).toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  }

  private generateProductionPDF(doc: jsPDF, data: any, startY: number): number {
    let yPos = startY;

    if (data.actualProduction?.length > 0) {
      yPos = this.addSection(
        doc,
        "A. HASIL PRODUKSI HARIAN",
        data.actualProduction,
        yPos,
        false,
        "Pcs"
      );
    }

    if (data.defectiveProducts?.length > 0) {
      yPos = this.addSection(
        doc,
        "B. BARANG GAGAL/CACAT",
        data.defectiveProducts,
        yPos,
        false,
        "Pcs"
      );
    }

    if (data.finishedGoodsStock?.length > 0) {
      yPos = this.addSection(
        doc,
        "C. STOCK BARANG JADI",
        data.finishedGoodsStock,
        yPos,
        false,
        "Pcs"
      );
    }

    if (data.finishedGoodsHP?.length > 0) {
      yPos = this.addSection(
        doc,
        "D. HP BARANG JADI",
        data.finishedGoodsHP,
        yPos,
        true
      );
    }

    if (data.productionObstacles?.length > 0) {
      yPos = this.addSection(
        doc,
        "E. KENDALA PRODUKSI",
        data.productionObstacles,
        yPos,
        false,
        ""
      );
    }

    return yPos;
  }

  private generateMarketingPDF(doc: jsPDF, data: any, startY: number): number {
    let yPos = startY;

    if (data.salesProducts?.length > 0) {
      yPos = this.addProductSection(
        doc,
        "A. PENJUALAN HARIAN",
        data.salesProducts,
        yPos
      );
    }

    if (data.salesTargets?.length > 0) {
      yPos = this.addSection(
        doc,
        "B. TARGET PENJUALAN SALES",
        data.salesTargets,
        yPos,
        true
      );
    }

    if (data.salesRealization?.length > 0) {
      yPos = this.addSection(
        doc,
        "C. PENJUALAN SALES",
        data.salesRealization,
        yPos,
        true
      );
    }

    if (data.salesReturns?.length > 0) {
      yPos = this.addSection(
        doc,
        "D. RETUR/POTONGAN",
        data.salesReturns,
        yPos,
        true
      );
    }

    if (data.salesObstacles?.length > 0) {
      yPos = this.addSection(
        doc,
        "E. KENDALA PENJUALAN",
        data.salesObstacles,
        yPos,
        false,
        ""
      );
    }

    return yPos;
  }

  private generateFinancePDF(doc: jsPDF, data: any, startY: number): number {
    let yPos = startY;

    // KAS
    if (
      data.kasReceivable?.length > 0 ||
      data.kasPayable?.length > 0 ||
      data.kasFinalBalance?.length > 0
    ) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("A. KAS", 20, yPos);
      yPos += 10;

      if (data.kasReceivable?.length > 0) {
        yPos = this.addSection(
          doc,
          "1. Penerimaan Kas",
          data.kasReceivable,
          yPos,
          true
        );
      }
      if (data.kasPayable?.length > 0) {
        yPos = this.addSection(
          doc,
          "2. Pengeluaran Kas",
          data.kasPayable,
          yPos,
          true
        );
      }
      if (data.kasFinalBalance?.length > 0) {
        yPos = this.addSection(
          doc,
          "3. Saldo Akhir Kas",
          data.kasFinalBalance,
          yPos,
          true
        );
      }
    }

    return yPos;
  }

  private generateHRDPDF(doc: jsPDF, data: any, startY: number): number {
    let yPos = startY;

    if (data.attendance?.length > 0) {
      yPos = this.addSection(
        doc,
        "A. KARYAWAN HADIR",
        data.attendance,
        yPos,
        false,
        "Orang"
      );
    }

    if (data.absentEmployees?.length > 0) {
      yPos = this.addSection(
        doc,
        "B. KARYAWAN TIDAK HADIR",
        data.absentEmployees,
        yPos,
        false,
        "Orang"
      );
    }

    if (data.employeeViolations?.length > 0) {
      yPos = this.addSection(
        doc,
        "C. PELANGGARAN KARYAWAN",
        data.employeeViolations,
        yPos,
        false,
        ""
      );
    }

    if (data.healthSafety?.length > 0) {
      yPos = this.addSection(
        doc,
        "D. KESEHATAN & KECELAKAAN KERJA (K3)",
        data.healthSafety,
        yPos,
        false,
        ""
      );
    }

    if (data.employeeObstacles?.length > 0) {
      yPos = this.addSection(
        doc,
        "E. KENDALA KARYAWAN",
        data.employeeObstacles,
        yPos,
        false,
        ""
      );
    }

    return yPos;
  }

  private generateWarehousePDF(doc: jsPDF, data: any, startY: number): number {
    let yPos = startY;

    if (data.initialRawMaterialStock?.length > 0) {
      yPos = this.addSection(
        doc,
        "A. STOCK BAHAN BAKU AWAL",
        data.initialRawMaterialStock,
        yPos,
        false,
        "Kg"
      );
    }

    if (data.rawMaterialUsage?.length > 0) {
      yPos = this.addSection(
        doc,
        "B. PEMAKAIAN",
        data.rawMaterialUsage,
        yPos,
        false,
        "Kg"
      );
    }

    if (data.finalRawMaterialStock?.length > 0) {
      yPos = this.addSection(
        doc,
        "C. STOCK BAHAN BAKU AKHIR",
        data.finalRawMaterialStock,
        yPos,
        false,
        "Kg"
      );
    }

    if (data.warehouseCondition?.length > 0) {
      yPos = this.addSection(
        doc,
        "D. KONDISI GUDANG",
        data.warehouseCondition,
        yPos,
        false,
        ""
      );
    }

    return yPos;
  }

  private addSection(
    doc: jsPDF,
    title: string,
    items: any[],
    startY: number,
    isCurrency: boolean = false,
    unit: string = ""
  ): number {
    let yPos = startY;

    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, yPos);
    yPos += 15;

    const tableData = items.map((item) => [
      item.description,
      isCurrency
        ? this.formatCurrency(item.amount)
        : unit
        ? `${this.formatNumber(item.amount)} ${unit}`
        : item.amount
        ? this.formatNumber(item.amount)
        : "-",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [
        [
          "Keterangan",
          isCurrency ? "Jumlah (Rp)" : unit ? `Jumlah (${unit})` : "Jumlah",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { left: 20, right: 20 },
    });

    return doc.lastAutoTable.finalY + 10;
  }

  private addProductSection(
    doc: jsPDF,
    title: string,
    products: any[],
    startY: number
  ): number {
    let yPos = startY;

    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, yPos);
    yPos += 15;

    const tableData = products.map((product) => [
      product.productName,
      product.description,
      this.formatCurrency(product.amount),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Produk", "Keterangan", "Jumlah (Rp)"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 220, 220] },
      margin: { left: 20, right: 20 },
    });

    return doc.lastAutoTable.finalY + 10;
  }
}

export const pdfService = new PDFService();
