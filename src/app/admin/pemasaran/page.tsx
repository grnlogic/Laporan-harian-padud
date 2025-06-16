"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Save, FileDown, Printer } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { EnhancedDynamicForm } from "@/app/components/ui/enhanced-dynamic-form";
import { DocumentPreview } from "@/app/components/ui/document-preview";
import { ReportHistory } from "@/app/components/ui/report-history";
import { EnhancedNavbar } from "@/app/components/ui/enhanced-navbar";
import { EnhancedFormCard } from "@/app/components/ui/enhanced-form-card";
import { FlexibleProductForm } from "@/app/components/ui/flexible-product-form";
import { laporanService } from "@/services/laporanService";
import { pdfService } from "@/services/pdfService";
import { printService } from "@/services/printService";
import type { LaporanHarianResponse, LaporanHarianRequest } from "@/types/api";

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface ProductRow {
  id: string;
  productName: string;
  description: string;
  amount: number;
}

interface MarketingFormData {
  salesProducts: ProductRow[]; // Ganti semua produk tetap dengan array produk fleksibel
  salesTargets: FormRow[];
  salesRealization: FormRow[];
  salesReturns: FormRow[];
  salesObstacles: FormRow[];
}

export default function NewMarketingAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<LaporanHarianResponse[]>([]);
  const [editingReport, setEditingReport] =
    useState<LaporanHarianResponse | null>(null);

  const [formData, setFormData] = useState<MarketingFormData>({
    salesProducts: [], // Form produk yang fleksibel
    salesTargets: [],
    salesRealization: [],
    salesReturns: [],
    salesObstacles: [],
  });

  // Define timeout constants to ensure number type
  const MESSAGE_TIMEOUT = 3000;
  const CLEAR_FORM_TIMEOUT = 2000;

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    // Fix: Accept both ROLE_PEMASARAN and ADMIN
    if (
      !storedUserName ||
      (userRole !== "ADMIN" && userRole !== "ROLE_PEMASARAN")
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

  const loadSavedReports = async () => {
    try {
      const reports = await laporanService.getMyLaporan();
      const marketingReports = reports
        .filter(
          (report) =>
            report.divisi === "ROLE_PEMASARAN" ||
            report.divisi === "Pemasaran" ||
            report.divisi === "ADMIN"
        )
        .map((report) => ({
          ...report,
          // Pastikan laporanId tetap sebagai string untuk kompatibilitas dengan interface
          laporanId: report.laporanId
            ? String(report.laporanId)
            : String((report as any).id || Date.now()),
          // Fix: gunakan namaUser bukan userName
          namaUser: report.namaUser || userName || "Admin",
        }));
      setSavedReports(marketingReports);
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

  const updateSection = (section: keyof MarketingFormData, rows: any[]) => {
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
      // PENJUALAN HARIAN - Produk Fleksibel
      ...formData.salesProducts.map((row) => ({
        ...row,
        kategoriUtama: "PENJUALAN",
        kategoriSub: row.productName, // Nama produk sebagai sub-kategori
        satuan: "Rupiah",
        description: row.description, // Deskripsi tetap dari field description
      })),
      // TARGET SALES
      ...formData.salesTargets.map((row) => ({
        ...row,
        kategoriUtama: "TARGET_SALES",
        kategoriSub: undefined,
        satuan: "Rupiah",
      })),
      // REALISASI SALES
      ...formData.salesRealization.map((row) => ({
        ...row,
        kategoriUtama: "REALISASI_SALES",
        kategoriSub: undefined,
        satuan: "Rupiah",
      })),
      // RETUR/POTONGAN
      ...formData.salesReturns.map((row) => ({
        ...row,
        kategoriUtama: "RETUR_POTONGAN",
        kategoriSub: undefined,
        satuan: "Rupiah",
      })),
      // KENDALA PENJUALAN
      ...formData.salesObstacles.map((row) => ({
        ...row,
        kategoriUtama: "KENDALA_PENJUALAN",
        kategoriSub: undefined,
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
        // Convert string to number for API call
        const reportId = parseInt(editingReport.laporanId, 10);

        if (isNaN(reportId)) {
          throw new Error("ID laporan tidak valid");
        }

        await laporanService.updateLaporan(reportId, payload);
        setMessage("Laporan pemasaran berhasil diperbarui!");
        setEditingReport(null);
      } else {
        await laporanService.createLaporan(payload);
        setMessage("Laporan pemasaran berhasil disimpan ke server!");
      }

      loadSavedReports();
      clearForm();
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
    const convertedData: MarketingFormData = {
      salesProducts: [],
      salesTargets: [],
      salesRealization: [],
      salesReturns: [],
      salesObstacles: [],
    };

    report.rincian.forEach((item) => {
      // Mapping berdasarkan kategori
      if (item.kategoriUtama === "PENJUALAN") {
        const productRow: ProductRow = {
          id: (Date.now() + Math.random()).toString(), // Fix: ensure string type
          productName: item.kategoriSub || "Produk",
          description: item.keterangan,
          amount: item.nilaiKuantitas || 0,
        };
        convertedData.salesProducts.push(productRow);
      } else if (item.kategoriUtama === "TARGET_SALES") {
        const formRow: FormRow = {
          id: (Date.now() + Math.random()).toString(), // Fix: ensure string type
          description: item.keterangan,
          amount: item.nilaiKuantitas || 0,
        };
        convertedData.salesTargets.push(formRow);
      } else if (item.kategoriUtama === "REALISASI_SALES") {
        const formRow: FormRow = {
          id: (Date.now() + Math.random()).toString(), // Fix: ensure string type
          description: item.keterangan,
          amount: item.nilaiKuantitas || 0,
        };
        convertedData.salesRealization.push(formRow);
      } else if (item.kategoriUtama === "RETUR_POTONGAN") {
        const formRow: FormRow = {
          id: (Date.now() + Math.random()).toString(), // Fix: ensure string type
          description: item.keterangan,
          amount: item.nilaiKuantitas || 0,
        };
        convertedData.salesReturns.push(formRow);
      } else if (item.kategoriUtama === "KENDALA_PENJUALAN") {
        const formRow: FormRow = {
          id: (Date.now() + Math.random()).toString(), // Fix: ensure string type
          description: item.keterangan,
          amount: item.nilaiKuantitas || 0,
        };
        convertedData.salesObstacles.push(formRow);
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
        loadSavedReports();
      } catch (err) {
        console.error("Gagal menghapus laporan:", err);
        setMessage("Gagal menghapus laporan dari server.");
      } finally {
        setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
      }
    }
  };

  const handleExportPDF = () => {
    pdfService.exportToPDF({
      division: "Pemasaran",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handlePrint = () => {
    printService.printReport({
      division: "Pemasaran",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handleExportReportPDF = (report: LaporanHarianResponse) => {
    pdfService.exportReportToPDF(report);
  };

  const clearForm = () => {
    setFormData({
      salesProducts: [],
      salesTargets: [],
      salesRealization: [],
      salesReturns: [],
      salesObstacles: [],
    });
    setEditingReport(null);
    setMessage("Form telah dikosongkan");
    setTimeout(() => setMessage(""), CLEAR_FORM_TIMEOUT);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <EnhancedNavbar
        userName={userName}
        currentDate={currentDate}
        onLogout={handleLogout}
        title="Pemasaran & Penjualan"
        divisionColor="green"
      />

      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-6">
        {/* Layout Utama: Panel Kiri (Form) + Panel Kanan (Preview) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Panel Kiri - Editor Form */}
          <div className="space-y-4 lg:space-y-6">
            <EnhancedFormCard
              title="Editor Laporan Pemasaran"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="green"
            >
              {/* A. PENJUALAN HARIAN - Form Produk Fleksibel */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  A. PENJUALAN HARIAN
                </h3>

                <FlexibleProductForm
                  title="Penjualan Produk"
                  subtitle="Tambahkan produk apa saja yang dijual hari ini"
                  buttonText="+ Tambah Produk"
                  products={formData.salesProducts}
                  onProductsChange={(products) =>
                    updateSection("salesProducts", products)
                  }
                  sectionColor="green"
                />
              </div>

              {/* B. TARGET PENJUALAN SALES */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  B. TARGET PENJUALAN SALES
                </h3>

                <EnhancedDynamicForm
                  title="Target Sales"
                  subtitle="Target penjualan per sales"
                  buttonText="+ Tambah Target Sales"
                  rows={formData.salesTargets}
                  onRowsChange={(rows) => updateSection("salesTargets", rows)}
                  sectionColor="green"
                />
              </div>

              {/* C. PENJUALAN SALES */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  C. PENJUALAN SALES
                </h3>

                <EnhancedDynamicForm
                  title="Realisasi Sales"
                  subtitle="Realisasi penjualan per sales"
                  buttonText="+ Tambah Realisasi Sales"
                  rows={formData.salesRealization}
                  onRowsChange={(rows) =>
                    updateSection("salesRealization", rows)
                  }
                  sectionColor="green"
                />
              </div>

              {/* D. RETUR/POTONGAN PENJUALAN */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  D. RETUR/POTONGAN PENJUALAN
                </h3>

                <EnhancedDynamicForm
                  title="Retur & Potongan"
                  subtitle="Retur dan potongan penjualan"
                  buttonText="+ Tambah Retur/Potongan"
                  rows={formData.salesReturns}
                  onRowsChange={(rows) => updateSection("salesReturns", rows)}
                  sectionColor="green"
                />
              </div>

              {/* E. KENDALA PENJUALAN */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  E. KENDALA PENJUALAN
                </h3>

                <EnhancedDynamicForm
                  title="Kendala Penjualan"
                  subtitle="Kendala yang dihadapi dalam penjualan"
                  buttonText="+ Tambah Kendala"
                  rows={formData.salesObstacles}
                  onRowsChange={(rows) => updateSection("salesObstacles", rows)}
                  currency={false}
                  unit=""
                  sectionColor="green"
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

              {/* Tombol Aksi */}
              <div className="flex flex-col gap-2 lg:gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  className="w-full h-12 lg:h-11 text-sm lg:text-base"
                  size="lg"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  {isLoading
                    ? "Menyimpan..."
                    : editingReport
                    ? "Perbarui Laporan"
                    : "Simpan Laporan"}
                </Button>

                {editingReport && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 lg:h-11 text-sm lg:text-base"
                    onClick={clearForm}
                  >
                    Batal Edit
                  </Button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 lg:h-11 text-sm lg:text-base"
                    onClick={handleExportPDF}
                  >
                    <FileDown className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    <span className="hidden sm:inline">Export PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 lg:h-11 text-sm lg:text-base"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </EnhancedFormCard>
          </div>

          {/* Panel Kanan - Preview Dokumen */}
          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="bg-white rounded-lg shadow-sm border p-3 lg:p-4 mb-4 max-h-96 xl:max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                Preview Dokumen
              </h2>
              <DocumentPreview
                division="Pemasaran"
                date={new Date().toISOString()}
                data={formData}
              />
            </div>
          </div>
        </div>

        {/* Panel Bawah - Riwayat Laporan */}
        <div className="mt-4 lg:mt-6">
          <ReportHistory
            reports={savedReports}
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
