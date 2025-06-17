"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Save, FileDown, Printer } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ReportHistory } from "@/app/components/ui/report-history";
import { EnhancedNavbar } from "@/app/components/ui/enhanced-navbar";
import { EnhancedFormCard } from "@/app/components/ui/enhanced-form-card";
import { EnhancedDynamicForm } from "@/app/components/ui/enhanced-dynamic-form";
import { DocumentPreview } from "@/app/components/ui/document-preview";
import { laporanService } from "@/services/laporanService";
import { pdfService } from "@/services/pdfService";
import { printService } from "@/services/printService";
import type { LaporanHarianResponse, LaporanHarianRequest } from "@/types/api";

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface ProductionFormData {
  actualProduction: FormRow[];
  defectiveProducts: FormRow[];
  finishedGoodsStock: FormRow[];
  finishedGoodsHP: FormRow[];
  productionObstacles: FormRow[];
}

export default function NewProductionAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<LaporanHarianResponse[]>([]);
  const [editingReport, setEditingReport] =
    useState<LaporanHarianResponse | null>(null);

  const [formData, setFormData] = useState<ProductionFormData>({
    actualProduction: [],
    defectiveProducts: [],
    finishedGoodsStock: [],
    finishedGoodsHP: [],
    productionObstacles: [],
  });

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    // Fix: Accept both ROLE_PRODUKSI and ADMIN
    if (
      !storedUserName ||
      (userRole !== "ADMIN" && userRole !== "ROLE_PRODUKSI")
    ) {
      router.push("/");
      return;
    }

    setUserName(storedUserName);

    // Set tanggal saat ini
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(today.toLocaleDateString("id-ID", options));

    // Muat laporan tersimpan dari backend
    loadSavedReports();
  }, [router]);

  // Define timeout constants to ensure number type
  const MESSAGE_TIMEOUT = 3000;
  const CLEAR_FORM_TIMEOUT = 2000;

  const loadSavedReports = async () => {
    try {
      const reports = await laporanService.getMyLaporan();

      // Validasi dan transformasi data jika perlu
      const validatedReports = reports
        .filter((report) => report && typeof report === "object")
        .map((report) => ({
          ...report,
          // Pastikan tanggal dalam format yang benar
          tanggalLaporan:
            report.tanggalLaporan || new Date().toISOString().split("T")[0],
          // Pastikan rincian adalah array
          rincian: Array.isArray(report.rincian) ? report.rincian : [],
          // Pastikan laporanId tetap sebagai string untuk kompatibilitas dengan interface
          laporanId: report.laporanId
            ? String(report.laporanId)
            : String((report as any).id || Date.now()),
          // Fix: gunakan namaUser bukan userName
          namaUser: report.namaUser || userName || "Admin",
        }))
        .filter(
          (report) =>
            // Filter untuk divisi produksi atau admin
            report.divisi === "ROLE_PRODUKSI" ||
            report.divisi === "Produksi" ||
            report.divisi === "ADMIN"
        );

      setSavedReports(validatedReports);
    } catch (err) {
      console.error("Gagal memuat riwayat laporan:", err);
      setMessage("Gagal memuat riwayat laporan dari server.");
      setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const updateSection = (
    section: keyof ProductionFormData,
    rows: FormRow[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: rows,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // 1. Kumpulkan semua rincian dari form ke dalam satu array
    const semuaRincian = [
      // HASIL PRODUKSI HARIAN
      ...formData.actualProduction.map((row) => ({
        ...row,
        kategoriUtama: "HASIL_PRODUKSI_AKTUAL", // ✅ Perbaikan
        kategoriSub: null,
        satuan: "Pcs",
      })),
      // BARANG GAGAL/CACAT
      ...formData.defectiveProducts.map((row) => ({
        ...row,
        kategoriUtama: "PRODUK_CACAT", // ✅ Perbaikan
        kategoriSub: null,
        satuan: "Pcs",
      })),
      // STOCK BARANG JADI
      ...formData.finishedGoodsStock.map((row) => ({
        ...row,
        kategoriUtama: "STOK_BARANG_JADI", // ✅ Perbaikan
        kategoriSub: null,
        satuan: "Pcs",
      })),
      // HP BARANG JADI
      ...formData.finishedGoodsHP.map((row) => ({
        ...row,
        kategoriUtama: "HARGA_POKOK_PRODUKSI", // ✅ Perbaikan
        kategoriSub: null,
        satuan: "Rupiah",
      })),
      // KENDALA PRODUKSI
      ...formData.productionObstacles.map((row) => ({
        ...row,
        kategoriUtama: "KENDALA_PRODUKSI", // ✅ Sudah benar
        kategoriSub: null,
        satuan: "",
      })),
    ];

    if (semuaRincian.length === 0) {
      setMessage("Minimal satu bagian harus diisi.");
      setIsLoading(false);
      return;
    }

    // 2. Format data sesuai ekspektasi backend
    const payload: LaporanHarianRequest = {
      tanggalLaporan: new Date().toISOString().split("T")[0],
      rincian: semuaRincian.map((item) => ({
        kategoriUtama: item.kategoriUtama,
        kategoriSub: item.kategoriSub || null,
        keterangan: item.description,
        nilaiKuantitas: item.amount || null,
        satuan: item.satuan,
      })),
    };

    try {
      if (editingReport) {
        // Perbarui laporan yang sudah ada - Convert string to number for API call
        const reportId = parseInt(editingReport.laporanId, 10);

        if (isNaN(reportId)) {
          throw new Error("ID laporan tidak valid");
        }

        await laporanService.updateLaporan(reportId, payload);
        setMessage("Laporan produksi berhasil diperbarui!");
        setEditingReport(null);
      } else {
        // Buat laporan baru
        await laporanService.createLaporan(payload);
        setMessage("Laporan produksi berhasil disimpan ke server!");
      }

      loadSavedReports(); // Muat ulang riwayat dari server
      clearForm(); // Bersihkan form
    } catch (err) {
      console.error("Gagal menyimpan laporan:", err);
      setMessage("Gagal menyimpan laporan ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
    }
  };

  const handleViewReport = (report: LaporanHarianResponse) => {
    // Konversi data backend kembali ke format form
    const convertedData: ProductionFormData = {
      actualProduction: [],
      defectiveProducts: [],
      finishedGoodsStock: [],
      finishedGoodsHP: [],
      productionObstacles: [],
    };

    report.rincian.forEach((item) => {
      const formRow: FormRow = {
        id: (Date.now() + Math.random()).toString(),
        description: item.keterangan,
        amount: item.nilaiKuantitas || 0,
      };

      // Mapping berdasarkan kategori
      if (item.kategoriUtama === "HASIL_PRODUKSI") {
        convertedData.actualProduction.push(formRow);
      } else if (item.kategoriUtama === "BARANG_CACAT") {
        convertedData.defectiveProducts.push(formRow);
      } else if (item.kategoriUtama === "STOCK_BARANG_JADI") {
        convertedData.finishedGoodsStock.push(formRow);
      } else if (item.kategoriUtama === "HP_BARANG_JADI") {
        convertedData.finishedGoodsHP.push(formRow);
      } else if (item.kategoriUtama === "KENDALA_PRODUKSI") {
        convertedData.productionObstacles.push(formRow);
      }
    });

    setFormData(convertedData);
    setMessage(
      `Menampilkan laporan tanggal ${new Date(
        report.tanggalLaporan
      ).toLocaleDateString("id-ID")}`
    );
    setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
  };

  const handleEditReport = (report: LaporanHarianResponse) => {
    // Sama seperti handleViewReport untuk editing
    handleViewReport(report);
    setEditingReport(report);
    setMessage(
      `Mode edit: Laporan tanggal ${new Date(
        report.tanggalLaporan
      ).toLocaleDateString("id-ID")}`
    );
    setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
  };

  const handleDeleteReport = async (report: LaporanHarianResponse) => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini dari server?")) {
      try {
        // Convert string to number for API call
        const reportId = parseInt(report.laporanId, 10);

        if (isNaN(reportId)) {
          throw new Error("ID laporan tidak valid");
        }

        await laporanService.deleteLaporan(reportId);
        setMessage("Laporan berhasil dihapus dari server!");
        loadSavedReports(); // Muat ulang data dari server untuk memperbarui daftar
      } catch (err) {
        console.error("Gagal menghapus laporan:", err);
        setMessage("Gagal menghapus laporan dari server.");
      } finally {
        setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
      }
    }
  };

  const clearForm = () => {
    setFormData({
      actualProduction: [],
      defectiveProducts: [],
      finishedGoodsStock: [],
      finishedGoodsHP: [],
      productionObstacles: [],
    });
    setEditingReport(null);
    setMessage("Form telah dikosongkan");
    setTimeout(() => setMessage(""), CLEAR_FORM_TIMEOUT);
  };

  const handleExportPDF = () => {
    pdfService.exportToPDF({
      division: "Produksi",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handlePrint = () => {
    printService.printReport({
      division: "Produksi",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handleExportReportPDF = (report: LaporanHarianResponse) => {
    pdfService.exportReportToPDF(report);
  };

  // Tambahkan validasi sebelum mengirim ke ReportHistory
  const validReports = savedReports.filter(
    (report) =>
      report &&
      report.laporanId &&
      report.tanggalLaporan &&
      Array.isArray(report.rincian)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <EnhancedNavbar
        userName={userName}
        currentDate={currentDate}
        onLogout={handleLogout}
        title="Produksi"
        divisionColor="orange"
      />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Layout Utama: Panel Kiri (Form) + Panel Kanan (Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Panel Kiri - Editor Form */}
          <div className="space-y-6">
            <EnhancedFormCard
              title="Editor Laporan Produksi"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="orange"
            >
              {/* A. HASIL PRODUKSI HARIAN */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-orange-600 border-b border-orange-200 pb-2">
                  A. HASIL PRODUKSI HARIAN
                </h3>

                <EnhancedDynamicForm
                  title="Hasil Produksi"
                  subtitle="Produk yang dihasilkan hari ini"
                  buttonText="+ Tambah Produk"
                  rows={formData.actualProduction}
                  onRowsChange={(rows) =>
                    updateSection("actualProduction", rows)
                  }
                  currency={false}
                  unit="Pcs"
                  sectionColor="orange"
                />
              </div>

              {/* B. BARANG GAGAL/CACAT PRODUKSI */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-orange-600 border-b border-orange-200 pb-2">
                  B. BARANG GAGAL/CACAT PRODUKSI
                </h3>

                <EnhancedDynamicForm
                  title="Barang Cacat"
                  subtitle="Produk yang cacat atau gagal"
                  buttonText="+ Tambah Barang Cacat"
                  rows={formData.defectiveProducts}
                  onRowsChange={(rows) =>
                    updateSection("defectiveProducts", rows)
                  }
                  currency={false}
                  unit="Pcs"
                  sectionColor="orange"
                />
              </div>

              {/* C. STOCK BARANG JADI */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-orange-600 border-b border-orange-200 pb-2">
                  C. STOCK BARANG JADI
                </h3>

                <EnhancedDynamicForm
                  title="Stock Barang Jadi"
                  subtitle="Stok barang jadi yang tersedia"
                  buttonText="+ Tambah Stock"
                  rows={formData.finishedGoodsStock}
                  onRowsChange={(rows) =>
                    updateSection("finishedGoodsStock", rows)
                  }
                  currency={false}
                  unit="Pcs"
                  sectionColor="orange"
                />
              </div>

              {/* D. HP BARANG JADI */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-orange-600 border-b border-orange-200 pb-2">
                  D. HP BARANG JADI
                </h3>

                <EnhancedDynamicForm
                  title="HP Barang Jadi"
                  subtitle="Harga pokok barang jadi"
                  buttonText="+ Tambah HP"
                  rows={formData.finishedGoodsHP}
                  onRowsChange={(rows) =>
                    updateSection("finishedGoodsHP", rows)
                  }
                  sectionColor="orange"
                />
              </div>

              {/* E. KENDALA PRODUKSI */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-orange-600 border-b border-orange-200 pb-2">
                  E. KENDALA PRODUKSI
                </h3>

                <EnhancedDynamicForm
                  title="Kendala Produksi"
                  subtitle="Kendala yang dihadapi dalam produksi"
                  buttonText="+ Tambah Kendala"
                  rows={formData.productionObstacles}
                  onRowsChange={(rows) =>
                    updateSection("productionObstacles", rows)
                  }
                  currency={false}
                  unit=""
                  sectionColor="orange"
                />
              </div>

              {/* Pesan */}
              {message && (
                <Alert
                  className={
                    message.includes("berhasil")
                      ? "border-green-200 bg-green-50"
                      : message.includes("Gagal") || message.includes("gagal")
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50"
                  }
                >
                  <AlertDescription
                    className={
                      message.includes("berhasil")
                        ? "text-green-800"
                        : message.includes("Gagal") || message.includes("gagal")
                        ? "text-red-800"
                        : "text-blue-800"
                    }
                  >
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              
            </EnhancedFormCard>
          </div>

          {/* Panel Kanan - Preview Dokumen */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Preview Dokumen
              </h2>
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mb-2">
                  Debug: {Object.values(formData).reduce((total, section) => total + section.length, 0)} items total
                </div>
              )}
              
              <DocumentPreview
                division="Produksi"
                date={new Date().toISOString()}
                data={formData}
              />
              
              {/* Fallback */}
              {Object.values(formData).every(section => section.length === 0) && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Belum ada data untuk ditampilkan</p>
                  <p className="text-xs mt-1">Mulai isi form untuk melihat preview</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <Button
                  type="button"
                  onClick={handleExportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs lg:text-sm px-3 py-1.5"
                  disabled={Object.values(formData).every(section => section.length === 0)}
                >
                  <FileDown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  Export PDF
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-xs lg:text-sm px-3 py-1.5"
                  disabled={Object.values(formData).every(section => section.length === 0)}
                >
                  <Printer className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Bawah - Riwayat Laporan */}
        <div className="mt-4 lg:mt-6">
          <ReportHistory
            reports={validReports}
            onView={handleViewReport}
            onEdit={handleEditReport}
            onDelete={handleDeleteReport}
            onExport={handleExportReportPDF}
          />
        </div>
      </div>
    </div>
  );
}
