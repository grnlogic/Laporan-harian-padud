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
  const [savedReports, setSavedReports] = useState<any[]>([]);

  const [formData, setFormData] = useState<WarehouseFormData>({
    initialRawMaterialStock: [],
    rawMaterialUsage: [],
    finalRawMaterialStock: [],
    warehouseCondition: [],
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
      localStorage.getItem("warehouseReports") || "[]"
    );
    setSavedReports(reports);
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
        division: "Distribusi & Gudang",
        data: formData,
        createdAt: new Date().toISOString(),
        createdBy: userName,
      };

      const existingReports = JSON.parse(
        localStorage.getItem("warehouseReports") || "[]"
      );
      existingReports.unshift(reportData);
      localStorage.setItem("warehouseReports", JSON.stringify(existingReports));

      setMessage("Laporan gudang berhasil disimpan!");
      loadSavedReports();

      // Reset form
      setFormData({
        initialRawMaterialStock: [],
        rawMaterialUsage: [],
        finalRawMaterialStock: [],
        warehouseCondition: [],
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
        localStorage.getItem("warehouseReports") || "[]"
      );
      const updatedReports = existingReports.filter(
        (r: any) => r.id !== report.id
      );
      localStorage.setItem("warehouseReports", JSON.stringify(updatedReports));
      loadSavedReports();
      setMessage("Laporan berhasil dihapus!");
      setTimeout(() => setMessage(""), 3000);
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
    setTimeout(() => setMessage(""), 2000);
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

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Layout: Left Panel (Form) + Right Panel (Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel - Form Editor */}
          <div className="space-y-6">
            <EnhancedFormCard
              title="Editor Laporan Gudang"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="purple"
            >
              {/* A. STOCK BAHAN BAKU AWAL */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
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
              <div className="space-y-4">
                <h3 className="text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
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
              <div className="space-y-4">
                <h3 className="text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
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
              <div className="space-y-4">
                <h3 className="text-md font-bold text-purple-600 border-b border-purple-200 pb-2">
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
                division="Distribusi & Gudang"
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
