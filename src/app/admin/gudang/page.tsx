"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import type { LaporanHarianResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Save, FileDown, Printer, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ReportHistory } from "@/app/components/ui/report-history";
import { EnhancedNavbar } from "@/app/components/ui/enhanced-navbar";
import { EnhancedFormCard } from "@/app/components/ui/enhanced-form-card";
import { EnhancedDynamicForm } from "@/app/components/ui/enhanced-dynamic-form";
import { DocumentPreview } from "@/app/components/ui/document-preview";
import { laporanService } from "@/services/laporanService";
import { pdfService } from "@/services/pdfService";
import { printService } from "@/services/printService";

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface WarehouseFormData {
  initialRawMaterialStock: FormRow[];
  rawMaterialUsage: FormRow[];
  finalRawMaterialStock: FormRow[];
  warehouseCondition: FormRow[];
}

export default function NewWarehouseAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<LaporanHarianResponse[]>([]);

  const [formData, setFormData] = useState<WarehouseFormData>({
    initialRawMaterialStock: [],
    rawMaterialUsage: [],
    finalRawMaterialStock: [],
    warehouseCondition: [],
  });

  // Define timeout constants to ensure number type
  const MESSAGE_TIMEOUT = 3000;
  const CLEAR_FORM_TIMEOUT = 2000;

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    // Fix: Accept both ROLE_GUDANG and ADMIN
    if (!storedUserName || (userRole !== "ADMIN" && userRole !== "ROLE_GUDANG")) {
      router.push("/");
      return;
    }

    setUserName(storedUserName);

    // Set current date
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(today.toLocaleDateString("id-ID", options));

    // Load saved reports from backend
    loadSavedReports();
  }, [router]);

  const loadSavedReports = async () => {
    try {
      // Get reports from backend API
      const reportsFromServer: LaporanHarianResponse[] =
        await laporanService.getMyLaporan();

      // Filter for warehouse division reports
      const warehouseReports = reportsFromServer
        .filter(
          (report) =>
            report.divisi === "ROLE_GUDANG" ||
            report.divisi === "Distribusi & Gudang" ||
            report.divisi === "GUDANG" ||
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

      setSavedReports(warehouseReports);
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

  const updateSection = (section: keyof WarehouseFormData, rows: FormRow[]) => {
    setFormData((prev) => ({
      ...prev,
      [section]: rows,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // 1. Collect all details from form into one array
    const semuaRincian = [
      ...formData.initialRawMaterialStock.map((row) => ({
        ...row,
        kategoriUtama: "STOK_BAHAN_BAKU", // ✅ Perbaikan: hapus spasi
        kategoriSub: "AWAL",
        satuan: "Kg",
      })),
      ...formData.rawMaterialUsage.map((row) => ({
        ...row,
        kategoriUtama: "PEMAKAIAN_BAHAN_BAKU", // ✅ Perbaikan
        kategoriSub: null,
        satuan: "Kg",
      })),
      ...formData.finalRawMaterialStock.map((row) => ({
        ...row,
        kategoriUtama: "STOK_BAHAN_BAKU", // ✅ Perbaikan: hapus spasi
        kategoriSub: "AKHIR",
        satuan: "Kg",
      })),
      ...formData.warehouseCondition.map((row) => ({
        ...row,
        kategoriUtama: "KONDISI_GUDANG", // ✅ Perbaikan: hapus spasi
        kategoriSub: null,
        satuan: "",
      })),
    ];

    if (semuaRincian.length === 0) {
      setMessage("Minimal satu bagian harus diisi.");
      setIsLoading(false);
      return;
    }

    // 2. Format data according to backend expectations
    const payload = {
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
      // 3. Send data to backend using laporanService - ubah dari create() ke createLaporan()
      await laporanService.createLaporan(payload);

      setMessage("Laporan gudang berhasil disimpan ke server!");
      loadSavedReports(); // Reload history from server
      clearForm(); // Clear form
    } catch (err) {
      console.error("Gagal menyimpan laporan:", err);
      setMessage("Gagal menyimpan laporan ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), MESSAGE_TIMEOUT);
    }
  };

  const handleViewReport = (report: LaporanHarianResponse) => {
    // Convert backend data back to form format
    const convertedData: WarehouseFormData = {
      initialRawMaterialStock: [],
      rawMaterialUsage: [],
      finalRawMaterialStock: [],
      warehouseCondition: [],
    };

    // Process rincian data back to form structure
    report.rincian?.forEach((item, index) => {
      const formRow: FormRow = {
        id: index.toString(), // Fix: convert index to string
        description: item.keterangan || "",
        amount: item.nilaiKuantitas || 0,
      };

      if (
        item.kategoriUtama === "STOCK BAHAN BAKU" &&
        item.kategoriSub === "AWAL"
      ) {
        convertedData.initialRawMaterialStock.push(formRow);
      } else if (item.kategoriUtama === "PEMAKAIAN") {
        convertedData.rawMaterialUsage.push(formRow);
      } else if (
        item.kategoriUtama === "STOCK BAHAN BAKU" &&
        item.kategoriSub === "AKHIR"
      ) {
        convertedData.finalRawMaterialStock.push(formRow);
      } else if (item.kategoriUtama === "KONDISI GUDANG") {
        convertedData.warehouseCondition.push(formRow);
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
    // Same logic as handleViewReport for editing
    handleViewReport(report);
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

        // Ubah dari delete() ke deleteLaporan()
        await laporanService.deleteLaporan(reportId);

        setMessage("Laporan berhasil dihapus dari server!");
        loadSavedReports(); // Reload data from server to update list
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
      initialRawMaterialStock: [],
      rawMaterialUsage: [],
      finalRawMaterialStock: [],
      warehouseCondition: [],
    });
    setMessage("Form telah dikosongkan");
    setTimeout(() => setMessage(""), CLEAR_FORM_TIMEOUT);
  };

  const handleExportPDF = () => {
    pdfService.exportToPDF({
      division: "Gudang",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handlePrint = () => {
    printService.printReport({
      division: "Gudang",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handleExportReportPDF = (report: LaporanHarianResponse) => {
    pdfService.exportReportToPDF(report);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <EnhancedNavbar
        userName={userName}
        currentDate={currentDate}
        onLogout={handleLogout}
        title="Distribusi & Gudang"
        divisionColor="purple"
      />

      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-6">
        {/* Main Layout: Left Panel (Form) + Right Panel (Preview) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Left Panel - Form Editor */}
          <div className="space-y-4 lg:space-y-6">
            <EnhancedFormCard
              title="Editor Laporan Gudang"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="purple"
            >
              {/* A. STOCK BAHAN BAKU AWAL */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
                  A. STOCK BAHAN BAKU AWAL
                </h3>

                <EnhancedDynamicForm
                  title="Stock Awal"
                  subtitle="Stock bahan baku di awal hari (PAITON, LOMBOK, PAITON ROKOK, BRAZIL, dst)"
                  buttonText="+ Tambah Stock Awal"
                  rows={formData.initialRawMaterialStock}
                  onRowsChange={(rows) =>
                    updateSection("initialRawMaterialStock", rows)
                  }
                  currency={false}
                  unit="Kg"
                  sectionColor="purple"
                />
              </div>

              {/* B. PEMAKAIAN */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
                  B. PEMAKAIAN
                </h3>

                <EnhancedDynamicForm
                  title="Pemakaian Bahan Baku"
                  subtitle="Bahan baku yang digunakan hari ini"
                  buttonText="+ Tambah Pemakaian"
                  rows={formData.rawMaterialUsage}
                  onRowsChange={(rows) =>
                    updateSection("rawMaterialUsage", rows)
                  }
                  currency={false}
                  unit="Kg"
                  sectionColor="purple"
                />
              </div>

              {/* C. STOCK BAHAN BAKU AKHIR */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
                  C. STOCK BAHAN BAKU AKHIR
                </h3>

                <EnhancedDynamicForm
                  title="Stock Akhir"
                  subtitle="Stock bahan baku di akhir hari"
                  buttonText="+ Tambah Stock Akhir"
                  rows={formData.finalRawMaterialStock}
                  onRowsChange={(rows) =>
                    updateSection("finalRawMaterialStock", rows)
                  }
                  currency={false}
                  unit="Kg"
                  sectionColor="purple"
                />
              </div>

              {/* D. KONDISI GUDANG */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
                  D. KONDISI GUDANG
                </h3>

                <EnhancedDynamicForm
                  title="Kondisi Gudang"
                  subtitle="Catatan kondisi gudang dan hal-hal penting"
                  buttonText="+ Tambah Catatan"
                  rows={formData.warehouseCondition}
                  onRowsChange={(rows) =>
                    updateSection("warehouseCondition", rows)
                  }
                  currency={false}
                  unit=""
                  sectionColor="purple"
                />
              </div>

              {/* Messages */}
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

              {/* Action Buttons */}
              
            </EnhancedFormCard>
          </div>

          {/* Right Panel - Document Preview */}
          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="bg-white rounded-lg shadow-sm border p-3 lg:p-4 mb-4 max-h-96 xl:max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">
                Preview Dokumen
              </h2>
              <DocumentPreview
                division="Gudang"
                date={new Date().toISOString()}
                data={formData}
              />
            </div>
          </div>
        </div>

        {/* Bottom Panel - Report History */}
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
