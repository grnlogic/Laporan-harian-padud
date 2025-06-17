"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import {
  Building2,
  LogOut,
  TrendingUp,
  Eye,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BarChart3,
  Users,
  FileText,
  Calendar,
  Activity,
  PieChart,
  FileDown,
} from "lucide-react";
import { laporanService } from "@/services/laporanService";
import { pdfService } from "@/services/pdfService";
import type { LaporanHarianResponse } from "@/types/api";

export default function SuperAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [allReports, setAllReports] = useState<LaporanHarianResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedView, setSelectedView] = useState<"dashboard" | "table">(
    "dashboard"
  );
  const [showAllReports, setShowAllReports] = useState(false);
  const itemsPerPage = 10;

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const today = now.toISOString().split("T")[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Division statistics
    const divisionStats = allReports.reduce((acc, report) => {
      const division = report.divisi || "Unknown";
      if (!acc[division]) {
        acc[division] = {
          total: 0,
          thisMonth: 0,
          avgItems: 0,
          totalItems: 0,
        };
      }
      acc[division].total++;
      acc[division].totalItems += report.rincian?.length || 0;

      // Check if report is from this month
      const reportDate = new Date(report.tanggalLaporan);
      if (
        reportDate.getMonth() === thisMonth &&
        reportDate.getFullYear() === thisYear
      ) {
        acc[division].thisMonth++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate average items per division
    Object.keys(divisionStats).forEach((division) => {
      const stats = divisionStats[division];
      stats.avgItems =
        stats.total > 0 ? Math.round(stats.totalItems / stats.total) : 0;
    });

    // Category analysis
    const categoryStats = allReports.reduce((acc, report) => {
      report.rincian?.forEach((item) => {
        const category = item.kategoriUtama;
        acc[category] = (acc[category] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Time series data (last 30 days)
    const timeSeriesData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const count = allReports.filter((report) =>
        report.tanggalLaporan.startsWith(dateStr)
      ).length;
      timeSeriesData.push({
        date: dateStr,
        count,
        label: date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
        }),
      });
    }

    return {
      totalReports: allReports.length,
      totalDivisions: Object.keys(divisionStats).length,
      reportsToday: allReports.filter((r) => r.tanggalLaporan.startsWith(today))
        .length,
      reportsThisWeek: allReports.filter((r) => r.tanggalLaporan >= weekAgo)
        .length,
      reportsThisMonth: Object.values(divisionStats).reduce(
        (sum: number, stats: any) => sum + stats.thisMonth,
        0
      ),
      divisionStats,
      categoryStats,
      timeSeriesData,
      topCategories: Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      activeDivisions: Object.entries(divisionStats).filter(
        ([, stats]: [string, any]) => stats.thisMonth > 0
      ).length,
    };
  }, [allReports]);

  useEffect(() => {
    // Validasi user dan role
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    console.log("🔍 Super Admin Page - Debug localStorage:");
    console.log("userName:", storedUserName);
    console.log("userRole:", userRole);

    // Accept both ADMIN and ROLE_SUPERADMIN untuk testing
    if (
      !storedUserName ||
      (userRole !== "ROLE_SUPERADMIN" && userRole !== "ADMIN")
    ) {
      console.log("❌ Tidak ada access, redirect ke login");
      console.log("Expected: ROLE_SUPERADMIN or ADMIN, Got:", userRole);
      router.push("/");
      return;
    }

    console.log("✅ Validasi berhasil, lanjut fetch data");
    setUserName(storedUserName);

    // Fetch data dari backend
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching data laporan...");

        // Gunakan service yang sudah diperbaiki
        const reportsData = await laporanService.getAllLaporan();

        console.log("✅ Raw data dari API:", reportsData);
        console.log("📊 Jumlah laporan:", reportsData.length);

        // Debug setiap laporan
        reportsData.forEach((report, index) => {
          console.log(`Laporan ${index + 1}:`, {
            id: report.laporanId,
            divisi: report.divisi,
            tanggal: report.tanggalLaporan,
            namaUser: report.namaUser,
            submittedBy: report.submittedBy,
            rincian: report.rincian?.length || 0,
          });
        });

        setAllReports(reportsData);
      } catch (err: any) {
        console.error("❌ Error fetching data:", err);
        console.error("❌ Error details:", {
          message: err.message,
          status: err.status,
          stack: err.stack,
        });

        setError(`Gagal mengambil data: ${err.message}`);

        // Jika unauthorized, redirect ke login
        if (
          err.message?.includes("403") ||
          err.message?.includes("401") ||
          err.message?.includes("Unauthorized") ||
          err.message?.includes("Forbidden")
        ) {
          console.log("🔒 Unauthorized access, redirecting to login");
          localStorage.clear();
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleDelete = async (laporanId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

    try {
      await laporanService.deleteLaporan(Number(laporanId));
      console.log("✅ Laporan berhasil dihapus");

      // Refresh data
      const reportsData = await laporanService.getAllLaporan();
      setAllReports(reportsData);
    } catch (error) {
      console.error("Error deleting laporan:", error);
    }
  };

  // Filter reports
  const filteredReports = allReports.filter((report) => {
    const matchesDivision =
      selectedDivision === "all" ||
      report.divisi?.toLowerCase().includes(selectedDivision.toLowerCase());

    const matchesSearch =
      searchTerm === "" ||
      report.divisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.namaUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tanggalLaporan?.includes(searchTerm);

    return matchesDivision && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function untuk mendapatkan summary dari rincian
  const getRincianSummary = (report: LaporanHarianResponse) => {
    if (!report.rincian || report.rincian.length === 0) {
      return {
        kategoriUtama: "Tidak ada data",
        totalItem: "0 item",
      };
    }

    const categories = [...new Set(report.rincian.map((r) => r.kategoriUtama))];
    const totalItems = report.rincian.length;

    return {
      kategoriUtama:
        categories.slice(0, 2).join(", ") +
        (categories.length > 2 ? "..." : ""),
      totalItem: `${totalItems} item`,
    };
  };

  // Mapping divisi untuk display yang lebih baik
  const getDivisiDisplay = (divisi: string) => {
    const divisiMap: Record<string, string> = {
      ROLE_PRODUKSI: "Produksi",
      ROLE_KEUANGAN: "Keuangan",
      ROLE_PEMASARAN: "Pemasaran",
      ROLE_GUDANG: "Gudang",
      ROLE_HRD: "HRD",
      ADMIN: "Admin",
    };
    return divisiMap[divisi] || divisi;
  };

  // Helper function to get preview content from rincian
  const getReportPreview = (report: LaporanHarianResponse) => {
    if (!report.rincian || report.rincian.length === 0) {
      return {
        sections: [],
        totalItems: 0,
        mainCategories: [],
      };
    }

    // Group by kategoriUtama
    const groupedByCategory = report.rincian.reduce((acc, item) => {
      const category = item.kategoriUtama;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    const sections = Object.entries(groupedByCategory).map(
      ([category, items]) => ({
        title: category.replace(/_/g, " "),
        items: items.slice(0, 3), // Show max 3 items per category
        totalItems: items.length,
        hasMore: items.length > 3,
      })
    );

    return {
      sections: sections.slice(0, 4), // Show max 4 categories
      totalItems: report.rincian.length,
      mainCategories: Object.keys(groupedByCategory),
      hasMoreSections: sections.length > 4,
    };
  };

  // Format currency for preview
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get division color
  const getDivisionColor = (divisi: string) => {
    const colorMap: Record<string, string> = {
      ROLE_PRODUKSI: "orange",
      ROLE_KEUANGAN: "blue",
      ROLE_PEMASARAN: "green",
      ROLE_GUDANG: "purple",
      ROLE_HRD: "red",
      ADMIN: "gray",
    };
    return colorMap[divisi] || "gray";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <TrendingUp className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
            <Button variant="outline" onClick={handleLogout}>
              Kembali ke Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-semibold text-gray-900">
                PADUD JAYA
              </span>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Super Admin
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Button
                  variant={selectedView === "dashboard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedView("dashboard")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={selectedView === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedView("table")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Tabel
                </Button>
              </div>
              <span className="text-sm text-gray-600">
                Selamat datang, <span className="font-medium">{userName}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === "dashboard" ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Laporan
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.totalReports}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Divisi Aktif
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.activeDivisions}
                      </p>
                      <p className="text-sm text-gray-500">
                        dari {analytics.totalDivisions} divisi
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Bulan Ini
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.reportsThisMonth}
                      </p>
                      <p className="text-sm text-gray-500">laporan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Minggu Ini
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.reportsThisWeek}
                      </p>
                      <p className="text-sm text-gray-500">laporan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Division Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performa per Divisi
                  </CardTitle>
                  <CardDescription>
                    Jumlah laporan yang disubmit setiap divisi bulan ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.divisionStats).map(
                      ([division, stats]: [string, any]) => (
                        <div
                          key={division}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">
                              {getDivisiDisplay(division)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {stats.total} total
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (stats.thisMonth /
                                      Math.max(
                                        ...Object.values(
                                          analytics.divisionStats
                                        ).map((s: any) => s.thisMonth)
                                      )) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">
                              {stats.thisMonth}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Kategori Teratas
                  </CardTitle>
                  <CardDescription>
                    Kategori yang paling sering dilaporkan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topCategories.map(([category, count], index) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0
                                ? "bg-blue-500"
                                : index === 1
                                ? "bg-green-500"
                                : index === 2
                                ? "bg-yellow-500"
                                : index === 3
                                ? "bg-purple-500"
                                : "bg-gray-500"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Aktivitas 30 Hari Terakhir
                </CardTitle>
                <CardDescription>
                  Trend laporan yang masuk dalam 30 hari terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {analytics.timeSeriesData.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="bg-blue-500 rounded-t w-full min-h-[4px] flex items-end justify-center text-xs text-white font-medium"
                        style={{
                          height: `${Math.max(
                            (item.count /
                              Math.max(
                                ...analytics.timeSeriesData.map((d) => d.count)
                              )) *
                              200,
                            4
                          )}px`,
                        }}
                        title={`${item.date}: ${item.count} laporan`}
                      >
                        {item.count > 0 && item.count}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Previews Section - NEW */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Preview Laporan Terbaru
                    </CardTitle>
                    <CardDescription>
                      Preview detail laporan dari semua divisi
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllReports(!showAllReports)}
                  >
                    {showAllReports ? "Tampilkan Sedikit" : "Tampilkan Semua"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(showAllReports ? allReports : allReports.slice(0, 2)).map(
                    (report, index) => {
                      const preview = getReportPreview(report);
                      const divisionColor = getDivisionColor(report.divisi);

                      return (
                        <div
                          key={report.laporanId || index}
                          className="border rounded-lg p-6 bg-gray-50"
                        >
                          {/* Report Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <Badge
                                variant="outline"
                                className={`border-${divisionColor}-300 text-${divisionColor}-700 bg-${divisionColor}-50`}
                              >
                                {getDivisiDisplay(report.divisi)}
                              </Badge>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {report.submittedBy || report.namaUser}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {formatDate(report.tanggalLaporan)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {preview.totalItems} item total
                              </p>
                              <p className="text-xs text-gray-500">
                                {preview.mainCategories.length} kategori
                              </p>
                            </div>
                          </div>

                          {/* Report Content Preview */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {preview.sections.map((section, sectionIndex) => (
                              <div
                                key={sectionIndex}
                                className="bg-white rounded-lg p-4 border"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <h5
                                    className={`font-medium text-${divisionColor}-700 capitalize`}
                                  >
                                    {section.title}
                                  </h5>
                                  {section.hasMore && (
                                    <span className="text-xs text-gray-500">
                                      +{section.totalItems - 3} lainnya
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  {section.items.map(
                                    (item: any, itemIndex: number) => (
                                      <div
                                        key={itemIndex}
                                        className="flex justify-between items-start text-sm"
                                      >
                                        <div className="flex-1 mr-2">
                                          <p className="text-gray-700 line-clamp-1">
                                            {item.keterangan}
                                          </p>
                                          {item.kategoriSub && (
                                            <p className="text-xs text-gray-500">
                                              {item.kategoriSub}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          {item.nilaiKuantitas && (
                                            <p className="font-medium text-gray-900">
                                              {item.satuan === "IDR" ||
                                              item.satuan === "Rupiah"
                                                ? formatCurrency(
                                                    item.nilaiKuantitas
                                                  )
                                                : `${item.nilaiKuantitas} ${
                                                    item.satuan || ""
                                                  }`}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>

                                {section.hasMore && (
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 text-center">
                                      Menampilkan 3 dari {section.totalItems}{" "}
                                      item
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {preview.hasMoreSections && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-dashed border-gray-300">
                              <p className="text-sm text-gray-600 text-center">
                                <Eye className="h-4 w-4 inline mr-1" />
                                Menampilkan 4 dari{" "}
                                {preview.mainCategories.length} kategori utama
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                console.log("Preview full report:", report)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Lihat Detail
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                pdfService.exportReportToPDF(report)
                              }
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              Export PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(report.laporanId)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      );
                    }
                  )}

                  {!showAllReports && allReports.length > 2 && (
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllReports(true)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Lihat {allReports.length - 2} Laporan Lainnya
                      </Button>
                    </div>
                  )}

                  {allReports.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada laporan yang tersedia untuk ditampilkan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports Preview - Update existing section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ringkasan Laporan Terbaru</CardTitle>
                <CardDescription>
                  Ringkasan singkat dari 5 laporan terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allReports.slice(0, 5).map((report, index) => (
                    <div
                      key={report.laporanId || index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {getDivisiDisplay(report.divisi)}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {report.submittedBy || report.namaUser}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(report.tanggalLaporan)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {report.rincian?.length || 0} item
                        </p>
                        <p className="text-xs text-gray-500">
                          {report.rincian?.[0]?.kategoriUtama?.replace(
                            /_/g,
                            " "
                          ) || "No category"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Existing Table View */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-medium mb-2">
                    Database Laporan Harian
                  </h3>
                  <p className="text-sm text-gray-600">
                    Kelola dan pantau semua laporan dari seluruh divisi. Total
                    laporan tersedia:{" "}
                    <span className="font-semibold">{allReports.length}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Riwayat Laporan Seluruh Divisi</CardTitle>
                <CardDescription>
                  Kelola dan pantau semua laporan dari seluruh divisi (
                  {allReports.length} laporan total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Cari berdasarkan divisi, penanggung jawab, atau tanggal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select
                    value={selectedDivision}
                    onValueChange={setSelectedDivision}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter Divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Divisi</SelectItem>
                      <SelectItem value="produksi">Produksi</SelectItem>
                      <SelectItem value="keuangan">Keuangan</SelectItem>
                      <SelectItem value="pemasaran">Pemasaran</SelectItem>
                      <SelectItem value="gudang">Gudang</SelectItem>
                      <SelectItem value="hrd">HRD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reports Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Penanggung Jawab</TableHead>
                        <TableHead>Kategori Utama</TableHead>
                        <TableHead>Total Item</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentReports.length > 0 ? (
                        currentReports.map((report, index) => {
                          const summary = getRincianSummary(report);
                          return (
                            <TableRow key={report.laporanId || index}>
                              <TableCell className="font-medium">
                                {formatDate(report.tanggalLaporan)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getDivisiDisplay(report.divisi)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {report.submittedBy ||
                                  report.namaUser ||
                                  "Unknown User"}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {summary.kategoriUtama}
                              </TableCell>
                              <TableCell>{summary.totalItem}</TableCell>
                              <TableCell>
                                <Badge className="bg-green-500">Selesai</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      console.log("Preview:", report)
                                    }
                                    title="Preview Laporan"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Print Laporan"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDelete(report.laporanId)
                                    }
                                    title="Hapus Laporan"
                                    className="hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-gray-500"
                          >
                            {allReports.length === 0
                              ? "Belum ada laporan yang tersedia"
                              : "Tidak ada laporan yang sesuai dengan filter"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Menampilkan {startIndex + 1}-
                      {Math.min(endIndex, filteredReports.length)} dari{" "}
                      {filteredReports.length} laporan
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>

                      <span className="text-sm">
                        Halaman {currentPage} dari {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Berikutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
