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
  const [savedReports, setSavedReports] = useState<any[]>([]);

  const [formData, setFormData] = useState<HRDFormData>({
    attendance: [],
    absentEmployees: [],
    employeeViolations: [],
    healthSafety: [],
    employeeObstacles: [],
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
    const reports = JSON.parse(localStorage.getItem("hrdReports") || "[]");
    setSavedReports(reports);
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
        division: "HRD",
        data: formData,
        createdAt: new Date().toISOString(),
        createdBy: userName,
      };

      const existingReports = JSON.parse(
        localStorage.getItem("hrdReports") || "[]"
      );
      existingReports.unshift(reportData);
      localStorage.setItem("hrdReports", JSON.stringify(existingReports));

      setMessage("Laporan HRD berhasil disimpan!");
      loadSavedReports();

      // Reset form
      setFormData({
        attendance: [],
        absentEmployees: [],
        employeeViolations: [],
        healthSafety: [],
        employeeObstacles: [],
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
        localStorage.getItem("hrdReports") || "[]"
      );
      const updatedReports = existingReports.filter(
        (r: any) => r.id !== report.id
      );
      localStorage.setItem("hrdReports", JSON.stringify(updatedReports));
      loadSavedReports();
      setMessage("Laporan berhasil dihapus!");
      setTimeout(() => setMessage(""), 3000);
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
    setMessage("Form telah dikosongkan");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <EnhancedNavbar
        {...({
          userName,
          currentDate,
          handleLogout,
        } as any)}
      />

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Layout: Left Panel (Form) + Right Panel (Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel - Form Editor */}
          <div className="space-y-6">
            <EnhancedFormCard
              divisionColor="red"
              title="Editor Laporan HRD"
              onClear={clearForm}
              onSubmit={handleSubmit}
              isLoading={false}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={clearForm}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* A. KARYAWAN HADIR */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-red-600 border-b border-red-200 pb-2">
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
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-red-600 border-b border-red-200 pb-2">
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
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-red-600 border-b border-red-200 pb-2">
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
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-red-600 border-b border-red-200 pb-2">
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
                <div className="space-y-4">
                  <h3 className="text-md font-bold text-red-600 border-b border-red-200 pb-2">
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
              </form>
            </EnhancedFormCard>
          </div>

          {/* Right Panel - Document Preview */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
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
