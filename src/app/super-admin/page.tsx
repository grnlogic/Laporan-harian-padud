"use client";

import { useState, useEffect } from "react";
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
  DollarSign,
  Package,
  Truck,
  Eye,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { laporanService } from "@/services/laporanService";
import type { LaporanHarianResponse } from "@/types/api";

interface KPIData {
  totalRevenue: number;
  productionEfficiency: number;
  cashBalance: number;
  totalShipments: number;
}

interface SalesData {
  date: string;
  revenue: number;
}

interface SalesPersonData {
  name: string;
  sales: number;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  // SEMUA STATE KOSONG - TIDAK ADA DATA DUMMY
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [salesTrendData, setSalesTrendData] = useState<SalesData[]>([]);
  const [salesPersonData, setSalesPersonData] = useState<SalesPersonData[]>([]);
  // Change this to use LaporanHarianResponse instead of ReportData
  const [allReports, setAllReports] = useState<LaporanHarianResponse[]>([]);

  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDivision, setSelectedDivision] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // useEffect UNTUK MENGAMBIL DATA DARI API
  useEffect(() => {
    // Validasi user dan role
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    console.log("🔍 Super Admin Page - Data localStorage:");
    console.log("userName:", storedUserName);
    console.log("userRole:", userRole);

    if (!storedUserName || userRole !== "ROLE_SUPERADMIN") {
      console.log("❌ Tidak ada access, redirect ke login");
      console.log("Expected: ROLE_SUPERADMIN, Got:", userRole);
      router.push("/");
      return;
    }

    console.log("✅ Validasi berhasil, lanjut fetch data");
    setUserName(storedUserName);

    // Fungsi untuk mengambil semua data dari backend
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ambil data laporan dari API menggunakan service baru
        const reportsData: LaporanHarianResponse[] =
          await laporanService.getAllLaporan();
        setAllReports(reportsData);

        // TODO: Implementasi endpoint untuk KPI dan Analytics
        // Untuk sementara, KPI dan grafik akan kosong
        // setKpiData(await kpiService.getKPI());
        // setSalesTrendData(await analyticsService.getSalesTrend());
        // setSalesPersonData(await analyticsService.getTopSales());

        console.log(
          "✅ Data laporan berhasil diambil:",
          reportsData.length,
          "laporan"
        );
      } catch (err: any) {
        console.error("❌ Gagal mengambil data:", err);
        setError(err.message || "Gagal mengambil data laporan");

        // Jika token tidak valid atau tidak punya izin, arahkan ke login
        if (err.message.includes("403") || err.message.includes("401")) {
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

  // Filter reports based on division and search term
  const filteredReports = allReports.filter((report) => {
    const matchesDivision =
      selectedDivision === "all" || report.divisi === selectedDivision;
    const matchesSearch =
      searchTerm === "" ||
      report.divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.tanggalLaporan.includes(searchTerm);

    return matchesDivision && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get summary of rincian data
  const getRincianSummary = (report: LaporanHarianResponse) => {
    if (!report.rincian || report.rincian.length === 0) {
      return { key1: "Tidak ada data", key2: "" };
    }

    const categories = [...new Set(report.rincian.map((r) => r.kategoriUtama))];
    const totalItems = report.rincian.length;

    return {
      key1: categories.slice(0, 2).join(", "),
      key2: `${totalItems} item`,
    };
  };

  // Kondisi loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Kondisi error
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
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
              <span className="text-xl font-semibold text-gray-900">PADUD</span>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Super Admin
              </h1>
            </div>

            <div className="flex items-center space-x-4">
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
        {/* KPI Cards - HANYA TAMPIL JIKA ADA DATA */}
        {kpiData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pendapatan Bersih
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(kpiData.totalRevenue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Tingkat Efisiensi Produksi
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpiData.productionEfficiency}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Saldo Akhir Kas
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(kpiData.cashBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pengiriman
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpiData.totalShipments.toLocaleString()} paket
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts - HANYA TAMPIL JIKA ADA DATA */}
        {(salesTrendData.length > 0 || salesPersonData.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend Chart */}
            {salesTrendData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tren Penjualan 7 Hari Terakhir</CardTitle>
                  <CardDescription>
                    Pendapatan harian dalam Rupiah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Pendapatan",
                        ]}
                        labelFormatter={(label) => `Tanggal: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: "#2563eb" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Sales Person Chart */}
            {salesPersonData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performa Penjualan per Sales (Top 5)</CardTitle>
                  <CardDescription>Penjualan dalam Rupiah</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesPersonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Penjualan",
                        ]}
                      />
                      <Bar dataKey="sales" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pesan jika belum ada data KPI/Analytics */}
        {!kpiData &&
          salesTrendData.length === 0 &&
          salesPersonData.length === 0 && (
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    Data KPI & Analytics Belum Tersedia
                  </h3>
                  <p className="text-sm">
                    Endpoint untuk data KPI dan Analytics masih dalam
                    pengembangan.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Reports Database */}
        <Card>
          <CardHeader>
            <CardTitle>Database Riwayat Laporan Seluruh Divisi</CardTitle>
            <CardDescription>
              Kelola dan pantau semua laporan dari seluruh divisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari berdasarkan divisi, penanggung jawab, atau data..."
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
                  <SelectItem value="Produksi">Produksi</SelectItem>
                  <SelectItem value="Keuangan">Keuangan</SelectItem>
                  <SelectItem value="Pemasaran">Pemasaran</SelectItem>
                  <SelectItem value="Distribusi & Gudang">
                    Distribusi & Gudang
                  </SelectItem>
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
                    currentReports.map((report) => {
                      const summary = getRincianSummary(report);
                      return (
                        <TableRow key={report.laporanId}>
                          <TableCell className="font-medium">
                            {formatDate(report.tanggalLaporan)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.divisi}</Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.submittedBy ||
                              report.namaUser ||
                              "Unknown User"}
                          </TableCell>
                          <TableCell>{summary.key1}</TableCell>
                          <TableCell>{summary.key2}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500">Selesai</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Printer className="h-4 w-4" />
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

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
      </div>
    </div>
  );
}
