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

interface FormRow {
  id: string;
  description: string;
  amount: number;
}

interface MarketingFormData {
  salesPadud06: FormRow[];
  salesSuperDeluxe: FormRow[];
  salesSuperDeluxeRed: FormRow[];
  salesPadud98: FormRow[];
  salesPadud98Red: FormRow[];
  salesPrimavera: FormRow[];
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
  const [savedReports, setSavedReports] = useState<any[]>([]);

  const [formData, setFormData] = useState<MarketingFormData>({
    salesPadud06: [],
    salesSuperDeluxe: [],
    salesSuperDeluxeRed: [],
    salesPadud98: [],
    salesPadud98Red: [],
    salesPrimavera: [],
    salesTargets: [],
    salesRealization: [],
    salesReturns: [],
    salesObstacles: [],
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
      localStorage.getItem("marketingReports") || "[]"
    );
    setSavedReports(reports);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const updateSection = (section: keyof MarketingFormData, rows: FormRow[]) => {
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
        division: "Pemasaran & Penjualan",
        data: formData,
        createdAt: new Date().toISOString(),
        createdBy: userName,
      };

      const existingReports = JSON.parse(
        localStorage.getItem("marketingReports") || "[]"
      );
      existingReports.unshift(reportData);
      localStorage.setItem("marketingReports", JSON.stringify(existingReports));

      setMessage("Laporan pemasaran berhasil disimpan!");
      loadSavedReports();

      // Reset form
      setFormData({
        salesPadud06: [],
        salesSuperDeluxe: [],
        salesSuperDeluxeRed: [],
        salesPadud98: [],
        salesPadud98Red: [],
        salesPrimavera: [],
        salesTargets: [],
        salesRealization: [],
        salesReturns: [],
        salesObstacles: [],
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
        localStorage.getItem("marketingReports") || "[]"
      );
      const updatedReports = existingReports.filter(
        (r: any) => r.id !== report.id
      );
      localStorage.setItem("marketingReports", JSON.stringify(updatedReports));
      loadSavedReports();
      setMessage("Laporan berhasil dihapus!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const clearForm = () => {
    setFormData({
      salesPadud06: [],
      salesSuperDeluxe: [],
      salesSuperDeluxeRed: [],
      salesPadud98: [],
      salesPadud98Red: [],
      salesPrimavera: [],
      salesTargets: [],
      salesRealization: [],
      salesReturns: [],
      salesObstacles: [],
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
        title="Pemasaran & Penjualan"
        divisionColor="green"
      />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Layout: Left Panel (Form) + Right Panel (Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel - Form Editor */}
          <div className="space-y-6">
            <EnhancedFormCard
              title="Editor Laporan Pemasaran"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              divisionColor="green"
            >
              {/* A. PENJUALAN HARIAN */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-green-600 border-b border-green-200 pb-2">
                  A. PENJUALAN HARIAN
                </h3>

                <EnhancedDynamicForm
                  title="1. Padud 0.6"
                  subtitle=""
                  buttonText="+ Tambah Penjualan Padud 0.6"
                  rows={formData.salesPadud06}
                  onRowsChange={(rows) => updateSection("salesPadud06", rows)}
                  sectionColor="green"
                />

                <EnhancedDynamicForm
                  title="2. Super Deluxe"
                  subtitle=""
                  buttonText="+ Tambah Penjualan Super Deluxe"
                  rows={formData.salesSuperDeluxe}
                  onRowsChange={(rows) =>
                    updateSection("salesSuperDeluxe", rows)
                  }
                  sectionColor="green"
                />

                <EnhancedDynamicForm
                  title="3. Super Deluxe Merah"
                  subtitle=""
                  buttonText="+ Tambah Super Deluxe Merah"
                  rows={formData.salesSuperDeluxeRed}
                  onRowsChange={(rows) =>
                    updateSection("salesSuperDeluxeRed", rows)
                  }
                  sectionColor="green"
                />

                <EnhancedDynamicForm
                  title="4. Padud 98"
                  subtitle=""
                  buttonText="+ Tambah Penjualan Padud 98"
                  rows={formData.salesPadud98}
                  onRowsChange={(rows) => updateSection("salesPadud98", rows)}
                  sectionColor="green"
                />

                <EnhancedDynamicForm
                  title="5. Padud 98 Merah"
                  subtitle=""
                  buttonText="+ Tambah Padud 98 Merah"
                  rows={formData.salesPadud98Red}
                  onRowsChange={(rows) =>
                    updateSection("salesPadud98Red", rows)
                  }
                  sectionColor="green"
                />

                <EnhancedDynamicForm
                  title="6. Primavera"
                  subtitle=""
                  buttonText="+ Tambah Penjualan Primavera"
                  rows={formData.salesPrimavera}
                  onRowsChange={(rows) => updateSection("salesPrimavera", rows)}
                  sectionColor="green"
                />
              </div>

              {/* B. TARGET PENJUALAN SALES */}
              <div className="space-y-4">
                <h3 className="text-md font-bold text-green-600 border-b border-green-200 pb-2">
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
              <div className="space-y-4">
                <h3 className="text-md font-bold text-green-600 border-b border-green-200 pb-2">
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
              <div className="space-y-4">
                <h3 className="text-md font-bold text-green-600 border-b border-green-200 pb-2">
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
              <div className="space-y-4">
                <h3 className="text-md font-bold text-green-600 border-b border-green-200 pb-2">
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
                division="Pemasaran & Penjualan"
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
