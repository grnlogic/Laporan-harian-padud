"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Save, FileDown, Printer, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { EnhancedDynamicForm } from "@/app/components/ui/enhanced-dynamic-form";
import { DocumentPreview } from "@/app/components/ui/document-preview";
import { ReportHistory } from "@/app/components/ui/report-history";
import { EnhancedNavbar } from "@/app/components/ui/enhanced-navbar";
import { EnhancedFormCard } from "@/app/components/ui/enhanced-form-card";
import { laporanService } from "@/services/laporanService";
import { pdfService } from "@/services/pdfService";
import { printService } from "@/services/printService";
import type { LaporanHarianResponse, LaporanHarianRequest } from "@/types/api";

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface HRDFormData {
  attendance: FormRow[];
  absentEmployees: FormRow[];
  employeeViolations: FormRow[];
  healthSafety: FormRow[];
  employeeObstacles: FormRow[];
}

export default function NewHRDAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<LaporanHarianResponse[]>([]);
  const [editingReport, setEditingReport] =
    useState<LaporanHarianResponse | null>(null);

  const [formData, setFormData] = useState<HRDFormData>({
    attendance: [],
    absentEmployees: [],
    employeeViolations: [],
    healthSafety: [],
    employeeObstacles: [],
  });

  // Define timeout constants to ensure number type
  const MESSAGE_TIMEOUT = 3000;
  const CLEAR_FORM_TIMEOUT = 2000;

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    // Fix: Accept both ROLE_HRD and ADMIN
    if (!storedUserName || (userRole !== "ADMIN" && userRole !== "ROLE_HRD")) {
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
      // Filter hanya laporan HRD
      const hrdReports = reports
        .filter(
          (report) =>
            report.divisi === "ROLE_HRD" ||
            report.divisi === "HRD" ||
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
      setSavedReports(hrdReports);
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

  const updateSection = (section: keyof HRDFormData, rows: FormRow[]) => {
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
      // KARYAWAN HADIR
      ...formData.attendance.map((row) => ({
        ...row,
        kategoriUtama: "KARYAWAN_HADIR",
        kategoriSub: undefined,
        satuan: "Orang",
      })),
      // KARYAWAN TIDAK HADIR
      ...formData.absentEmployees.map((row) => ({
        ...row,
        kategoriUtama: "KARYAWAN_TIDAK_HADIR",
        kategoriSub: undefined,
        satuan: "Orang",
      })),
      // PELANGGARAN KARYAWAN
      ...formData.employeeViolations.map((row) => ({
        ...row,
        kategoriUtama: "PELANGGARAN_KARYAWAN",
        kategoriSub: undefined,
        satuan: "",
      })),
      // KESEHATAN & KECELAKAAN KERJA (K3)
      ...formData.healthSafety.map((row) => ({
        ...row,
        kategoriUtama: "KESEHATAN_KECELAKAAN_KERJA",
        kategoriSub: undefined,
        satuan: "",
      })),
      // KENDALA KARYAWAN
      ...formData.employeeObstacles.map((row) => ({
        ...row,
        kategoriUtama: "KENDALA_KARYAWAN",
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
        setMessage("Laporan HRD berhasil diperbarui!");
        setEditingReport(null);
      } else {
        // Buat laporan baru
        await laporanService.createLaporan(payload);
        setMessage("Laporan HRD berhasil disimpan ke server!");
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
    const convertedData: HRDFormData = {
      attendance: [],
      absentEmployees: [],
      employeeViolations: [],
      healthSafety: [],
      employeeObstacles: [],
    };

    report.rincian.forEach((item) => {
      const formRow: FormRow = {
        id: (Date.now() + Math.random()).toString(), // Fix: ensure string type
        description: item.keterangan,
        amount: item.nilaiKuantitas || 0,
      };

      // Mapping berdasarkan kategori
      if (item.kategoriUtama === "KARYAWAN_HADIR") {
        convertedData.attendance.push(formRow);
      } else if (item.kategoriUtama === "KARYAWAN_TIDAK_HADIR") {
        convertedData.absentEmployees.push(formRow);
      } else if (item.kategoriUtama === "PELANGGARAN_KARYAWAN") {
        convertedData.employeeViolations.push(formRow);
      } else if (item.kategoriUtama === "KESEHATAN_KECELAKAAN_KERJA") {
        convertedData.healthSafety.push(formRow);
      } else if (item.kategoriUtama === "KENDALA_KARYAWAN") {
        convertedData.employeeObstacles.push(formRow);
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
      attendance: [],
      absentEmployees: [],
      employeeViolations: [],
      healthSafety: [],
      employeeObstacles: [],
    });
    setEditingReport(null);
    setMessage("Form telah dikosongkan");
    setTimeout(() => setMessage(""), CLEAR_FORM_TIMEOUT);
  };

  const handleExportPDF = () => {
    pdfService.exportToPDF({
      division: "HRD",
      date: new Date().toISOString(),
      data: formData,
      userName: userName,
    });
  };

  const handlePrint = () => {
    printService.printReport({
      division: "HRD",
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
        title="HRD & Personalia"
        divisionColor="red"
      />

      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 lg:py-6">
        {/* Layout Utama: Panel Kiri (Form) + Panel Kanan (Preview) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Panel Kiri - Editor Form */}
          <div className="space-y-4 lg:space-y-6">
            <EnhancedFormCard
              title="Editor Laporan HRD"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="red"
            >
              {/* A. KARYAWAN HADIR */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-red-600 border-b border-red-200 pb-2">
                  A. KARYAWAN HADIR
                </h3>

                <EnhancedDynamicForm
                  title="Kehadiran"
                  subtitle="Karyawan yang hadir (MANAGEMENT, SALES, PRODUKSI, BLENDING, ROKOK)"
                  buttonText="+ Tambah Kehadiran"
                  rows={formData.attendance}
                  onRowsChange={(rows) => updateSection("attendance", rows)}
                  currency={false}
                  unit="Orang"
                  sectionColor="red"
                />
              </div>

              {/* B. KARYAWAN TIDAK HADIR */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-red-600 border-b border-red-200 pb-2">
                  B. KARYAWAN TIDAK HADIR
                </h3>

                <EnhancedDynamicForm
                  title="Ketidakhadiran"
                  subtitle="Karyawan yang tidak hadir dengan alasan"
                  buttonText="+ Tambah Ketidakhadiran"
                  rows={formData.absentEmployees}
                  onRowsChange={(rows) =>
                    updateSection("absentEmployees", rows)
                  }
                  currency={false}
                  unit="Orang"
                  sectionColor="red"
                />
              </div>

              {/* C. CATATAN PELANGGARAN KARYAWAN */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-red-600 border-b border-red-200 pb-2">
                  C. CATATAN PELANGGARAN KARYAWAN
                </h3>

                <EnhancedDynamicForm
                  title="Pelanggaran Karyawan"
                  subtitle="Catatan pelanggaran yang dilakukan karyawan"
                  buttonText="+ Tambah Pelanggaran"
                  rows={formData.employeeViolations}
                  onRowsChange={(rows) =>
                    updateSection("employeeViolations", rows)
                  }
                  currency={false}
                  unit=""
                  sectionColor="red"
                />
              </div>

              {/* D. KESEHATAN & KECELAKAAN KERJA (K3) */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-red-600 border-b border-red-200 pb-2">
                  D. KESEHATAN & KECELAKAAN KERJA (K3)
                </h3>

                <EnhancedDynamicForm
                  title="K3"
                  subtitle="Insiden kecelakaan kerja dan penanganannya"
                  buttonText="+ Tambah Insiden K3"
                  rows={formData.healthSafety}
                  onRowsChange={(rows) => updateSection("healthSafety", rows)}
                  currency={false}
                  unit=""
                  sectionColor="red"
                />
              </div>

              {/* E. KENDALA KARYAWAN */}
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm lg:text-md font-bold text-red-600 border-b border-red-200 pb-2">
                  E. KENDALA KARYAWAN
                </h3>

                <EnhancedDynamicForm
                  title="Kendala Karyawan"
                  subtitle="Kendala yang dihadapi karyawan"
                  buttonText="+ Tambah Kendala"
                  rows={formData.employeeObstacles}
                  onRowsChange={(rows) =>
                    updateSection("employeeObstacles", rows)
                  }
                  currency={false}
                  unit=""
                  sectionColor="red"
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
                division="HRD"
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
