"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Save, FileDown, Printer, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { ReportHistory } from "@/app/components/ui/report-history";
import { EnhancedNavbar } from "@/app/components/ui/enhanced-navbar";
import { EnhancedFormCard } from "@/app/components/ui/enhanced-form-card";
import { EnhancedDynamicForm } from "@/app/components/ui/enhanced-dynamic-form";
import { DocumentPreview } from "@/app/components/ui/document-preview";

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
  const [savedReports, setSavedReports] = useState<any[]>([]);

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

    if (!storedUserName || userRole !== "admin") {
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

    // Load saved reports
    loadSavedReports();
  }, [router]);

  const loadSavedReports = () => {
    const reports = JSON.parse(
      localStorage.getItem("productionReports") || "[]"
    );
    setSavedReports(reports);
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

    // Validate that at least one section has data
    const hasData = Object.values(formData).some(
      (section) => section.length > 0
    );

    if (!hasData) {
      setMessage("Minimal satu bagian harus diisi.");
      setIsLoading(false);
      return;
    }

    // Simulate saving
    setTimeout(() => {
      const reportData = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        division: "Produksi",
        data: formData,
        createdAt: new Date().toISOString(),
        createdBy: userName,
      };

      const existingReports = JSON.parse(
        localStorage.getItem("productionReports") || "[]"
      );
      existingReports.unshift(reportData);
      localStorage.setItem(
        "productionReports",
        JSON.stringify(existingReports)
      );

      setMessage("Laporan produksi berhasil disimpan!");
      loadSavedReports();

      // Reset form
      setFormData({
        actualProduction: [],
        defectiveProducts: [],
        finishedGoodsStock: [],
        finishedGoodsHP: [],
        productionObstacles: [],
      });

      setTimeout(() => setMessage(""), 3000);
      setIsLoading(false);
    }, 1000);
  };

  const handleViewReport = (report: any) => {
    setFormData(report.data);
    setMessage(
      `Menampilkan laporan tanggal ${new Date(report.date).toLocaleDateString(
        "id-ID"
      )}`
    );
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEditReport = (report: any) => {
    setFormData(report.data);
    setMessage(
      `Mode edit: Laporan tanggal ${new Date(report.date).toLocaleDateString(
        "id-ID"
      )}`
    );
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteReport = (report: any) => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      const existingReports = JSON.parse(
        localStorage.getItem("productionReports") || "[]"
      );
      const updatedReports = existingReports.filter(
        (r: any) => r.id !== report.id
      );
      localStorage.setItem("productionReports", JSON.stringify(updatedReports));
      loadSavedReports();
      setMessage("Laporan berhasil dihapus!");
      setTimeout(() => setMessage(""), 3000);
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
        {/* Main Layout: Left Panel (Form) + Right Panel (Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel - Form Editor */}
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

              {/* Messages */}
              {message && (
                <Alert
                  className={
                    message.includes("berhasil")
                      ? "border-green-200 bg-green-50"
                      : "border-blue-200 bg-blue-50"
                  }
                >
                  <AlertDescription
                    className={
                      message.includes("berhasil")
                        ? "text-green-800"
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
                  {isLoading ? "Menyimpan..." : "Simpan Laporan"}
                </Button>

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
                division="Produksi"
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
