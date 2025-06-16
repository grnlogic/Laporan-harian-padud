interface PrintData {
  division: string;
  date: string;
  data: any;
  userName?: string;
}

class PrintService {
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

  printReport(printData: PrintData): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedDate = new Date(printData.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Fix untuk userName yang undefined
    const displayUserName = printData.userName || "Admin";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Harian ${printData.division}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.4;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 { 
            margin: 0; 
            font-size: 20px; 
            font-weight: bold;
          }
          .header h2 { 
            margin: 5px 0; 
            font-size: 16px; 
          }
          .header p { 
            margin: 5px 0; 
            font-size: 14px; 
          }
          .section { 
            margin: 20px 0; 
            page-break-inside: avoid;
          }
          .section-title { 
            font-weight: bold; 
            font-size: 14px; 
            margin-bottom: 10px;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
            font-size: 12px;
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .footer { 
            margin-top: 30px; 
            text-align: right; 
            font-size: 12px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PT. PADUD JAYA</h1>
          <h2>LAPORAN HARIAN ${printData.division.toUpperCase()}</h2>
          <p>Tanggal: ${formattedDate}</p>
          <p>Dibuat oleh: ${displayUserName}</p>
        </div>
        
        ${this.generatePrintContent(printData)}
        
        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleDateString(
            "id-ID"
          )} ${new Date().toLocaleTimeString("id-ID")}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  private generatePrintContent(printData: PrintData): string {
    switch (printData.division) {
      case "Produksi":
        return this.generateProductionPrint(printData.data);
      case "Pemasaran":
        return this.generateMarketingPrint(printData.data);
      case "Keuangan":
        return this.generateFinancePrint(printData.data);
      case "HRD":
        return this.generateHRDPrint(printData.data);
      case "Gudang":
        return this.generateWarehousePrint(printData.data);
      default:
        return "<p>Format laporan tidak dikenali</p>";
    }
  }

  private generateProductionPrint(data: any): string {
    let content = "";

    if (data.actualProduction?.length > 0) {
      content += this.createSection(
        "A. HASIL PRODUKSI HARIAN",
        data.actualProduction,
        false,
        "Pcs"
      );
    }
    if (data.defectiveProducts?.length > 0) {
      content += this.createSection(
        "B. BARANG GAGAL/CACAT",
        data.defectiveProducts,
        false,
        "Pcs"
      );
    }
    if (data.finishedGoodsStock?.length > 0) {
      content += this.createSection(
        "C. STOCK BARANG JADI",
        data.finishedGoodsStock,
        false,
        "Pcs"
      );
    }
    if (data.finishedGoodsHP?.length > 0) {
      content += this.createSection(
        "D. HP BARANG JADI",
        data.finishedGoodsHP,
        true
      );
    }
    if (data.productionObstacles?.length > 0) {
      content += this.createSection(
        "E. KENDALA PRODUKSI",
        data.productionObstacles,
        false,
        ""
      );
    }

    return content;
  }

  private generateMarketingPrint(data: any): string {
    let content = "";

    if (data.salesProducts?.length > 0) {
      content += this.createProductSection(
        "A. PENJUALAN HARIAN",
        data.salesProducts
      );
    }
    if (data.salesTargets?.length > 0) {
      content += this.createSection(
        "B. TARGET PENJUALAN SALES",
        data.salesTargets,
        true
      );
    }
    if (data.salesRealization?.length > 0) {
      content += this.createSection(
        "C. PENJUALAN SALES",
        data.salesRealization,
        true
      );
    }
    if (data.salesReturns?.length > 0) {
      content += this.createSection(
        "D. RETUR/POTONGAN",
        data.salesReturns,
        true
      );
    }
    if (data.salesObstacles?.length > 0) {
      content += this.createSection(
        "E. KENDALA PENJUALAN",
        data.salesObstacles,
        false,
        ""
      );
    }

    return content;
  }

  private generateFinancePrint(data: any): string {
    let content = "";

    // KAS Section
    if (
      data.kasReceivable?.length > 0 ||
      data.kasPayable?.length > 0 ||
      data.kasFinalBalance?.length > 0
    ) {
      content += '<div class="section"><div class="section-title">A. KAS</div>';
      if (data.kasReceivable?.length > 0) {
        content += this.createSubSection(
          "1. Penerimaan Kas",
          data.kasReceivable,
          true
        );
      }
      if (data.kasPayable?.length > 0) {
        content += this.createSubSection(
          "2. Pengeluaran Kas",
          data.kasPayable,
          true
        );
      }
      if (data.kasFinalBalance?.length > 0) {
        content += this.createSubSection(
          "3. Saldo Akhir Kas",
          data.kasFinalBalance,
          true
        );
      }
      content += "</div>";
    }

    // Continue with other sections...
    return content;
  }

  private generateHRDPrint(data: any): string {
    let content = "";

    if (data.attendance?.length > 0) {
      content += this.createSection(
        "A. KARYAWAN HADIR",
        data.attendance,
        false,
        "Orang"
      );
    }
    if (data.absentEmployees?.length > 0) {
      content += this.createSection(
        "B. KARYAWAN TIDAK HADIR",
        data.absentEmployees,
        false,
        "Orang"
      );
    }
    if (data.employeeViolations?.length > 0) {
      content += this.createSection(
        "C. PELANGGARAN KARYAWAN",
        data.employeeViolations,
        false,
        ""
      );
    }
    if (data.healthSafety?.length > 0) {
      content += this.createSection(
        "D. KESEHATAN & KECELAKAAN KERJA (K3)",
        data.healthSafety,
        false,
        ""
      );
    }
    if (data.employeeObstacles?.length > 0) {
      content += this.createSection(
        "E. KENDALA KARYAWAN",
        data.employeeObstacles,
        false,
        ""
      );
    }

    return content;
  }

  private generateWarehousePrint(data: any): string {
    let content = "";

    if (data.initialRawMaterialStock?.length > 0) {
      content += this.createSection(
        "A. STOCK BAHAN BAKU AWAL",
        data.initialRawMaterialStock,
        false,
        "Kg"
      );
    }
    if (data.rawMaterialUsage?.length > 0) {
      content += this.createSection(
        "B. PEMAKAIAN",
        data.rawMaterialUsage,
        false,
        "Kg"
      );
    }
    if (data.finalRawMaterialStock?.length > 0) {
      content += this.createSection(
        "C. STOCK BAHAN BAKU AKHIR",
        data.finalRawMaterialStock,
        false,
        "Kg"
      );
    }
    if (data.warehouseCondition?.length > 0) {
      content += this.createSection(
        "D. KONDISI GUDANG",
        data.warehouseCondition,
        false,
        ""
      );
    }

    return content;
  }

  private createSection(
    title: string,
    items: any[],
    isCurrency: boolean = false,
    unit: string = ""
  ): string {
    let content = `<div class="section"><div class="section-title">${title}</div>`;
    content += "<table><thead><tr>";
    content += "<th>Keterangan</th>";
    content += `<th>${
      isCurrency ? "Jumlah (Rp)" : unit ? `Jumlah (${unit})` : "Jumlah"
    }</th>`;
    content += "</tr></thead><tbody>";

    items.forEach((item) => {
      content += "<tr>";
      content += `<td>${item.description}</td>`;
      content += `<td>${
        isCurrency
          ? this.formatCurrency(item.amount)
          : unit
          ? `${this.formatNumber(item.amount)} ${unit}`
          : item.amount
          ? this.formatNumber(item.amount)
          : "-"
      }</td>`;
      content += "</tr>";
    });

    content += "</tbody></table></div>";
    return content;
  }

  private createProductSection(title: string, products: any[]): string {
    let content = `<div class="section"><div class="section-title">${title}</div>`;
    content += "<table><thead><tr>";
    content += "<th>Produk</th><th>Keterangan</th><th>Jumlah (Rp)</th>";
    content += "</tr></thead><tbody>";

    products.forEach((product) => {
      content += "<tr>";
      content += `<td>${product.productName}</td>`;
      content += `<td>${product.description}</td>`;
      content += `<td>${this.formatCurrency(product.amount)}</td>`;
      content += "</tr>";
    });

    content += "</tbody></table></div>";
    return content;
  }

  private createSubSection(
    title: string,
    items: any[],
    isCurrency: boolean = false
  ): string {
    let content = `<div style="margin-left: 20px; margin-bottom: 15px;">`;
    content += `<div style="font-weight: bold; margin-bottom: 5px;">${title}</div>`;
    content += "<table><thead><tr>";
    content += "<th>Keterangan</th>";
    content += `<th>${isCurrency ? "Jumlah (Rp)" : "Jumlah"}</th>`;
    content += "</tr></thead><tbody>";

    items.forEach((item) => {
      content += "<tr>";
      content += `<td>${item.description}</td>`;
      content += `<td>${
        isCurrency
          ? this.formatCurrency(item.amount)
          : this.formatNumber(item.amount)
      }</td>`;
      content += "</tr>";
    });

    content += "</tbody></table></div>";
    return content;
  }
}

export const printService = new PrintService();
