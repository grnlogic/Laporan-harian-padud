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
import { LaporanHarianResponse, LaporanHarianRequest } from "@/types/api";

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface FinanceFormData {
  kasReceivable: FormRow[];
  kasPayable: FormRow[];
  kasFinalBalance: FormRow[];
  piutangNew: FormRow[];
  piutangCollection: FormRow[];
  piutangFinalBalance: FormRow[];
  hutangNew: FormRow[];
  hutangPayment: FormRow[];
  hutangFinalBalance: FormRow[];
  modalStock: FormRow[];
  modalEquipment: FormRow[];
  modalFinalBalance: FormRow[];
}

export default function NewFinanceAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<LaporanHarianResponse[]>([]);
  const [editingReport, setEditingReport] =
    useState<LaporanHarianResponse | null>(null);

  const [formData, setFormData] = useState<FinanceFormData>({
    kasReceivable: [],
    kasPayable: [],
    kasFinalBalance: [],
    piutangNew: [],
    piutangCollection: [],
    piutangFinalBalance: [],
    hutangNew: [],
    hutangPayment: [],
    hutangFinalBalance: [],
    modalStock: [],
    modalEquipment: [],
    modalFinalBalance: [],
  });

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    if (!storedUserName || userRole !== "ROLE_KEUANGAN") {
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

    // Load saved reports dari backend
    loadSavedReports();
  }, [router]);

  const loadSavedReports = async () => {
    try {
      const reports = await laporanService.getMyLaporan();
      // Filter hanya laporan keuangan
      const financeReports = reports.filter(
        (report) =>
          report.divisi === "ROLE_KEUANGAN" || report.divisi === "Keuangan"
      );
      setSavedReports(financeReports);
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

  const updateSection = (section: keyof FinanceFormData, rows: FormRow[]) => {
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
      // KAS
      ...formData.kasReceivable.map((row) => ({
        ...row,
        kategoriUtama: "KAS",
        kategoriSub: "PENERIMAAN",
        satuan: "IDR",
      })),
      ...formData.kasPayable.map((row) => ({
        ...row,
        kategoriUtama: "KAS",
        kategoriSub: "PENGELUARAN",
        satuan: "IDR",
      })),
      ...formData.kasFinalBalance.map((row) => ({
        ...row,
        kategoriUtama: "KAS",
        kategoriSub: "SALDO_AKHIR",
        satuan: "IDR",
      })),
      // PIUTANG
      ...formData.piutangNew.map((row) => ({
        ...row,
        kategoriUtama: "PIUTANG",
        kategoriSub: "BARU",
        satuan: "IDR",
      })),
      ...formData.piutangCollection.map((row) => ({
        ...row,
        kategoriUtama: "PIUTANG",
        kategoriSub: "PENAGIHAN",
        satuan: "IDR",
      })),
      ...formData.piutangFinalBalance.map((row) => ({
        ...row,
        kategoriUtama: "PIUTANG",
        kategoriSub: "SALDO_AKHIR",
        satuan: "IDR",
      })),
      // HUTANG
      ...formData.hutangNew.map((row) => ({
        ...row,
        kategoriUtama: "HUTANG",
        kategoriSub: "BARU",
        satuan: "IDR",
      })),
      ...formData.hutangPayment.map((row) => ({
        ...row,
        kategoriUtama: "HUTANG",
        kategoriSub: "PEMBAYARAN",
        satuan: "IDR",
      })),
      ...formData.hutangFinalBalance.map((row) => ({
        ...row,
        kategoriUtama: "HUTANG",
        kategoriSub: "SALDO_AKHIR",
        satuan: "IDR",
      })),
      // MODAL
      ...formData.modalStock.map((row) => ({
        ...row,
        kategoriUtama: "MODAL",
        kategoriSub: "STOK",
        satuan: "IDR",
      })),
      ...formData.modalEquipment.map((row) => ({
        ...row,
        kategoriUtama: "MODAL",
        kategoriSub: "PERALATAN",
        satuan: "IDR",
      })),
      ...formData.modalFinalBalance.map((row) => ({
        ...row,
        kategoriUtama: "MODAL",
        kategoriSub: "TOTAL",
        satuan: "IDR",
      })),
    ];

    if (semuaRincian.length === 0) {
      setMessage("Minimal satu bagian harus diisi.");
      setIsLoading(false);
      return;
    }

    // 2. Format data according to backend expectations
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
        // Update existing report
        await laporanService.updateLaporan(editingReport.laporanId, payload);
        setMessage("Laporan keuangan berhasil diperbarui!");
        setEditingReport(null);
      } else {
        // Create new report
        await laporanService.createLaporan(payload);
        setMessage("Laporan keuangan berhasil disimpan ke server!");
      }

      loadSavedReports(); // Reload history from server
      clearForm(); // Clear form
    } catch (err) {
      console.error("Gagal menyimpan laporan:", err);
      setMessage("Gagal menyimpan laporan ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleViewReport = (report: LaporanHarianResponse) => {
    // Convert backend data back to form format
    const convertedData: FinanceFormData = {
      kasReceivable: [],
      kasPayable: [],
      kasFinalBalance: [],
      piutangNew: [],
      piutangCollection: [],
      piutangFinalBalance: [],
      hutangNew: [],
      hutangPayment: [],
      hutangFinalBalance: [],
      modalStock: [],
      modalEquipment: [],
      modalFinalBalance: [],
    };

    report.rincian.forEach((item) => {
      const formRow: FormRow = {
        id: Date.now().toString() + Math.random(),
        description: item.keterangan,
        amount: item.nilaiKuantitas || 0,
      };

      // Map berdasarkan kategori
      if (item.kategoriUtama === "KAS") {
        if (item.kategoriSub === "PENERIMAAN") {
          convertedData.kasReceivable.push(formRow);
        } else if (item.kategoriSub === "PENGELUARAN") {
          convertedData.kasPayable.push(formRow);
        } else if (item.kategoriSub === "SALDO_AKHIR") {
          convertedData.kasFinalBalance.push(formRow);
        }
      } else if (item.kategoriUtama === "PIUTANG") {
        if (item.kategoriSub === "BARU") {
          convertedData.piutangNew.push(formRow);
        } else if (item.kategoriSub === "PENAGIHAN") {
          convertedData.piutangCollection.push(formRow);
        } else if (item.kategoriSub === "SALDO_AKHIR") {
          convertedData.piutangFinalBalance.push(formRow);
        }
      } else if (item.kategoriUtama === "HUTANG") {
        if (item.kategoriSub === "BARU") {
          convertedData.hutangNew.push(formRow);
        } else if (item.kategoriSub === "PEMBAYARAN") {
          convertedData.hutangPayment.push(formRow);
        } else if (item.kategoriSub === "SALDO_AKHIR") {
          convertedData.hutangFinalBalance.push(formRow);
        }
      } else if (item.kategoriUtama === "MODAL") {
        if (item.kategoriSub === "STOK") {
          convertedData.modalStock.push(formRow);
        } else if (item.kategoriSub === "PERALATAN") {
          convertedData.modalEquipment.push(formRow);
        } else if (item.kategoriSub === "TOTAL") {
          convertedData.modalFinalBalance.push(formRow);
        }
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
    // Same logic as handleViewReport for editing
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
        loadSavedReports();
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        console.error("Gagal menghapus laporan:", err);
        setMessage("Gagal menghapus laporan dari server.");
        setTimeout(() => setMessage(""), 3000);
      }
    }
  };

  const clearForm = () => {
    setFormData({
      kasReceivable: [],
      kasPayable: [],
      kasFinalBalance: [],
      piutangNew: [],
      piutangCollection: [],
      piutangFinalBalance: [],
      hutangNew: [],
      hutangPayment: [],
      hutangFinalBalance: [],
      modalStock: [],
      modalEquipment: [],
      modalFinalBalance: [],
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
        title="Keuangan & Administrasi"
        divisionColor="blue"
      />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Layout: Left Panel (Form) + Right Panel (Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel - Form Editor */}
          <div className="space-y-6">
            <EnhancedFormCard
              title={
                editingReport
                  ? "Edit Laporan Keuangan"
                  : "Editor Laporan Keuangan"
              }
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="blue"
            >
              {editingReport && (
                <Alert className="border-orange-200 bg-orange-50 mb-4">
                  <AlertDescription className="text-orange-800">
                    Sedang mengedit laporan tanggal{" "}
                    {new Date(editingReport.tanggalLaporan).toLocaleDateString(
                      "id-ID"
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* A. KAS */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-blue-600 border-b border-blue-200 pb-2">
                  A. KAS
                </h3>

                <EnhancedDynamicForm
                  title="1. Penerimaan Kas"
                  subtitle=""
                  buttonText="+ Tambah Penerimaan"
                  rows={formData.kasReceivable}
                  onRowsChange={(rows) => updateSection("kasReceivable", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="2. Pengeluaran Kas"
                  subtitle=""
                  buttonText="+ Tambah Pengeluaran"
                  rows={formData.kasPayable}
                  onRowsChange={(rows) => updateSection("kasPayable", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="3. Saldo Akhir Kas"
                  subtitle=""
                  buttonText="+ Tambah Saldo"
                  rows={formData.kasFinalBalance}
                  onRowsChange={(rows) =>
                    updateSection("kasFinalBalance", rows)
                  }
                  sectionColor="blue"
                />
              </div>

              {/* B. PIUTANG */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  B. PIUTANG
                </h3>

                <EnhancedDynamicForm
                  title="1. Piutang Baru"
                  subtitle=""
                  buttonText="+ Tambah Piutang Baru"
                  rows={formData.piutangNew}
                  onRowsChange={(rows) => updateSection("piutangNew", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="2. Penagihan Piutang"
                  subtitle=""
                  buttonText="+ Tambah Penagihan"
                  rows={formData.piutangCollection}
                  onRowsChange={(rows) =>
                    updateSection("piutangCollection", rows)
                  }
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="3. Saldo Akhir Piutang"
                  subtitle=""
                  buttonText="+ Tambah Saldo Piutang"
                  rows={formData.piutangFinalBalance}
                  onRowsChange={(rows) =>
                    updateSection("piutangFinalBalance", rows)
                  }
                  sectionColor="blue"
                />
              </div>

              {/* C. HUTANG */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-red-600 border-b border-red-200 pb-2">
                  C. HUTANG
                </h3>

                <EnhancedDynamicForm
                  title="1. Hutang Baru"
                  subtitle=""
                  buttonText="+ Tambah Hutang Baru"
                  rows={formData.hutangNew}
                  onRowsChange={(rows) => updateSection("hutangNew", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="2. Pembayaran Hutang"
                  subtitle=""
                  buttonText="+ Tambah Pembayaran"
                  rows={formData.hutangPayment}
                  onRowsChange={(rows) => updateSection("hutangPayment", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="3. Saldo Akhir Hutang"
                  subtitle=""
                  buttonText="+ Tambah Saldo Hutang"
                  rows={formData.hutangFinalBalance}
                  onRowsChange={(rows) =>
                    updateSection("hutangFinalBalance", rows)
                  }
                  sectionColor="blue"
                />
              </div>

              {/* D. MODAL */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
                  D. MODAL
                </h3>

                <EnhancedDynamicForm
                  title="1. Modal Stok"
                  subtitle=""
                  buttonText="+ Tambah Modal Stok"
                  rows={formData.modalStock}
                  onRowsChange={(rows) => updateSection("modalStock", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="2. Modal Peralatan"
                  subtitle=""
                  buttonText="+ Tambah Modal Peralatan"
                  rows={formData.modalEquipment}
                  onRowsChange={(rows) => updateSection("modalEquipment", rows)}
                  sectionColor="blue"
                />

                <EnhancedDynamicForm
                  title="3. Total Modal"
                  subtitle=""
                  buttonText="+ Tambah Total Modal"
                  rows={formData.modalFinalBalance}
                  onRowsChange={(rows) =>
                    updateSection("modalFinalBalance", rows)
                  }
                  sectionColor="blue"
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

          {/* Right Panel - Document Preview */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Preview Dokumen
              </h2>
              <DocumentPreview
                division="Keuangan & Administrasi"
                date={new Date().toISOString()}
                data={formData}
              />
            </div>
          </div>
        </div>

        {/* Bottom Panel - Report History */}
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
