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

interface ReportData {
  id: string;
  date: string;
  division: string;
  responsible: string;
  key1: string;
  key2: string;
  status: "completed" | "pending" | "late";
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // KPI Data
  const [kpiData] = useState<KPIData>({
    totalRevenue: 2450000000, // 2.45 Miliar
    productionEfficiency: 96.5,
    cashBalance: 850000000, // 850 Juta
    totalShipments: 1250,
  });

  // Sales trend data (7 days)
  const [salesTrendData] = useState<SalesData[]>([
    { date: "08/06", revenue: 320000000 },
    { date: "09/06", revenue: 280000000 },
    { date: "10/06", revenue: 380000000 },
    { date: "11/06", revenue: 350000000 },
    { date: "12/06", revenue: 420000000 },
    { date: "13/06", revenue: 390000000 },
    { date: "14/06", revenue: 410000000 },
  ]);

  // Top 5 sales performance
  const [salesPersonData] = useState<SalesPersonData[]>([
    { name: "Ahmad Rizki", sales: 85000000 },
    { name: "Siti Nurhaliza", sales: 78000000 },
    { name: "Budi Santoso", sales: 72000000 },
    { name: "Maya Sari", sales: 68000000 },
    { name: "Dedi Kurniawan", sales: 65000000 },
  ]);

  // All reports data
  const [allReports] = useState<ReportData[]>([
    {
      id: "1",
      date: "2025-06-14",
      division: "Produksi",
      responsible: "Admin Produksi",
      key1: "950 kg",
      key2: "95% Efisiensi",
      status: "completed",
    },
    {
      id: "2",
      date: "2025-06-14",
      division: "Keuangan",
      responsible: "Admin Keuangan",
      key1: "Rp 850M",
      key2: "Rp 420M Pendapatan",
      status: "completed",
    },
    {
      id: "3",
      date: "2025-06-14",
      division: "Pemasaran",
      responsible: "Admin Pemasaran",
      key1: "125 Prospek",
      key2: "85% Konversi",
      status: "pending",
    },
    {
      id: "4",
      date: "2025-06-14",
      division: "Distribusi & Gudang",
      responsible: "Admin Gudang",
      key1: "1250 Paket",
      key2: "98% On-time",
      status: "completed",
    },
    {
      id: "5",
      date: "2025-06-13",
      division: "Produksi",
      responsible: "Admin Produksi",
      key1: "1020 kg",
      key2: "102% Efisiensi",
      status: "completed",
    },
    {
      id: "6",
      date: "2025-06-13",
      division: "Keuangan",
      responsible: "Admin Keuangan",
      key1: "Rp 820M",
      key2: "Rp 390M Pendapatan",
      status: "completed",
    },
    {
      id: "7",
      date: "2025-06-13",
      division: "Pemasaran",
      responsible: "Admin Pemasaran",
      key1: "110 Prospek",
      key2: "78% Konversi",
      status: "late",
    },
    {
      id: "8",
      date: "2025-06-13",
      division: "Distribusi & Gudang",
      responsible: "Admin Gudang",
      key1: "1180 Paket",
      key2: "96% On-time",
      status: "completed",
    },
    {
      id: "9",
      date: "2025-06-12",
      division: "Produksi",
      responsible: "Admin Produksi",
      key1: "980 kg",
      key2: "98% Efisiensi",
      status: "completed",
    },
    {
      id: "10",
      date: "2025-06-12",
      division: "Keuangan",
      responsible: "Admin Keuangan",
      key1: "Rp 800M",
      key2: "Rp 380M Pendapatan",
      status: "completed",
    },
    {
      id: "11",
      date: "2025-06-12",
      division: "Pemasaran",
      responsible: "Admin Pemasaran",
      key1: "95 Prospek",
      key2: "82% Konversi",
      status: "completed",
    },
    {
      id: "12",
      date: "2025-06-12",
      division: "Distribusi & Gudang",
      responsible: "Admin Gudang",
      key1: "1320 Paket",
      key2: "99% On-time",
      status: "completed",
    },
  ]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole");

    if (!storedUserName || userRole !== "superadmin") {
      router.push("/");
      return;
    }

    setUserName(storedUserName);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Filter reports based on division and search term
  const filteredReports = allReports.filter((report) => {
    const matchesDivision =
      selectedDivision === "all" || report.division === selectedDivision;
    const matchesSearch =
      searchTerm === "" ||
      report.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.key1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.key2.toLowerCase().includes(searchTerm.toLowerCase());

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Selesai</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "late":
        return <Badge variant="destructive">Terlambat</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

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
        {/* KPI Cards */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tren Penjualan 7 Hari Terakhir</CardTitle>
              <CardDescription>Pendapatan harian dalam Rupiah</CardDescription>
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
        </div>

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
                    <TableHead>Data Kunci 1</TableHead>
                    <TableHead>Data Kunci 2</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {formatDate(report.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.division}</Badge>
                      </TableCell>
                      <TableCell>{report.responsible}</TableCell>
                      <TableCell>{report.key1}</TableCell>
                      <TableCell>{report.key2}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
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
                  ))}
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
                          className="w-8 h-8 p-0"
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
