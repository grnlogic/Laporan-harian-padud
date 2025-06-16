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
  const [editingReport, setEditingReport] = useState<LaporanHarianResponse | null>(null);

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

    // Perbaiki validasi role untuk produksi
    if (!storedUserName || userRole !== "ROLE_PRODUKSI") {
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
      // Filter hanya laporan produksi
      const productionReports = reports.filter(
        (report) =>
          report.divisi === "ROLE_PRODUKSI" || report.divisi === "Produksi"
      );
      setSavedReports(productionReports);
    } catch (err) {
      console.error("Gagal memuat riwayat laporan:", err);
      setMessage("Gagal memuat riwayat laporan dari server.");
      setTimeout(() => setMessage(""), 3000);
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
        kategoriUtama: "HASIL_PRODUKSI",
        kategoriSub: undefined,
        satuan: "Pcs",
      })),
      // BARANG GAGAL/CACAT
      ...formData.defectiveProducts.map((row) => ({
        ...row,
        kategoriUtama: "BARANG_CACAT",
        kategoriSub: undefined,
        satuan: "Pcs",
      })),
      // STOCK BARANG JADI
      ...formData.finishedGoodsStock.map((row) => ({
        ...row,
        kategoriUtama: "STOCK_BARANG_JADI",
        kategoriSub: undefined,
        satuan: "Pcs",
      })),
      // HP BARANG JADI
      ...formData.finishedGoodsHP.map((row) => ({
        ...row,
        kategoriUtama: "HP_BARANG_JADI",
        kategoriSub: undefined,
        satuan: "Rupiah",
      })),
      // KENDALA PRODUKSI
      ...formData.productionObstacles.map((row) => ({
        ...row,
        kategoriUtama: "KENDALA_PRODUKSI",
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
        // Perbarui laporan yang sudah ada
        await laporanService.updateLaporan(editingReport.laporanId, payload);
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
      setTimeout(() => setMessage(""), 3000);
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
        id: Date.now().toString() + Math.random(),
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
    setTimeout(() => setMessage(""), 3000);
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
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteReport = async (report: LaporanHarianResponse) => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini dari server?")) {
      try {
        await laporanService.deleteLaporan(report.laporanId);
        setMessage("Laporan berhasil dihapus dari server!");
        loadSavedReports(); // Muat ulang data dari server untuk memperbarui daftar
      } catch (err) {
        console.error("Gagal menghapus laporan:", err);
        setMessage("Gagal menghapus laporan dari server.");
      } finally {
        setTimeout(() => setMessage(""), 3000);
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
    setTimeout(() => setMessage(""), 2000);
  };

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

              {/* Tombol Aksi */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  <Save className="h-5 w-5 mr-2" />
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
                    onClick={clearForm}
                  >
                    Batal Edit
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" size="lg">
                    <FileDown className="h-5 w-5 mr-2" />
                    Export PDF
                  </Button>

                  <Button type="button" variant="outline" size="lg">
                    <Printer className="h-5 w-5 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </EnhancedFormCard>
          </div>

          {/* Panel Kanan - Preview Dokumen */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Preview Dokumen
              </h2>
              <DocumentPreview
                division="Produksi"
                date={new Date().toISOString()}
                data={formData}
              />
            </div>
          </div>
        </div>

        {/* Panel Bawah - Riwayat Laporan */}
        <ReportHistory
          reports={savedReports}
          onView={handleViewReport}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
          onExport={(report) => console.log("Export", report)}
          className="mt-6"
        />
      </div>
    </div>
  );
}
