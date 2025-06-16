"use client"

import { Card, CardContent, CardHeader } from "@/app/components/ui/card"

interface FormRow {
  id: string
  description: string
  amount: number
}

interface DocumentPreviewProps {
  division: string
  date: string
  data: any
  className?: string
}

export function DocumentPreview({ division, date, data, className = "" }: DocumentPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (amount: number) => {
    return amount.toLocaleString("id-ID")
  }

  const calculateTotal = (section: FormRow[]) => {
    return section.reduce((sum, row) => sum + (row.amount || 0), 0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderSection = (title: string, rows: FormRow[], currency = true, unit = "") => {
    if (!rows || rows.length === 0) return null

    const total = calculateTotal(rows)

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <div className="space-y-1 ml-4">
          {rows.map((row, index) => (
            <div key={row.id} className="flex justify-between items-center py-1 text-sm">
              <span className="text-gray-700">{row.description || `${index + 1}.`}</span>
              <span className="font-medium">
                {currency ? formatCurrency(row.amount) : `${formatNumber(row.amount)} ${unit}`}
              </span>
            </div>
          ))}
          {rows.length > 1 && (
            <div className="flex justify-between items-center pt-1 border-t border-gray-200 font-bold text-sm">
              <span>Total {title}:</span>
              <span>{currency ? formatCurrency(total) : `${formatNumber(total)} ${unit}`}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // DIVISI KEUANGAN & ADMINISTRASI
  if (division === "Keuangan & Administrasi") {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader className="bg-blue-50 border-b text-center py-4">
          <h2 className="text-lg font-bold text-gray-900">LAPORAN HARIAN</h2>
          <h3 className="text-md font-semibold text-blue-600">DIVISI KEUANGAN & ADMINISTRASI</h3>
          <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(date)}</p>
        </CardHeader>
        <CardContent className="p-4 max-h-[600px] overflow-y-auto text-sm">
          <div className="space-y-6">
            {/* A. KAS */}
            <div>
              <h3 className="text-md font-bold text-blue-600 mb-3">A. KAS</h3>
              {renderSection("1. Penerimaan Kas", data.kasReceivable)}
              {renderSection("2. Pengeluaran Kas", data.kasPayable)}
              {renderSection("3. Saldo Akhir Kas", data.kasFinalBalance)}
            </div>

            {/* B. PIUTANG */}
            <div>
              <h3 className="text-md font-bold text-blue-600 mb-3">B. PIUTANG</h3>
              {renderSection("1. Piutang Baru", data.piutangNew)}
              {renderSection("2. Piutang Ditagih", data.piutangCollection)}
              {renderSection("3. Piutang Macet", data.piutangMacet || [])}
              {renderSection("4. Saldo Akhir Piutang", data.piutangFinalBalance)}
            </div>

            {/* C. HUTANG */}
            <div>
              <h3 className="text-md font-bold text-blue-600 mb-3">C. HUTANG</h3>
              {renderSection("1. Hutang Baru", data.hutangNew)}
              {renderSection("2. Hutang Dibayar", data.hutangPayment)}
              {renderSection("3. Saldo Akhir Hutang", data.hutangFinalBalance)}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // DIVISI PEMASARAN & PENJUALAN
  if (division === "Pemasaran & Penjualan") {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader className="bg-green-50 border-b text-center py-4">
          <h2 className="text-lg font-bold text-gray-900">LAPORAN HARIAN</h2>
          <h3 className="text-md font-semibold text-green-600">DIVISI PEMASARAN & PENJUALAN</h3>
          <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(date)}</p>
        </CardHeader>
        <CardContent className="p-4 max-h-[600px] overflow-y-auto text-sm">
          <div className="space-y-6">
            {/* A. PENJUALAN HARIAN */}
            <div>
              <h3 className="text-md font-bold text-green-600 mb-3">A. PENJUALAN HARIAN</h3>
              {renderSection("1. Padud 0.6", data.salesPadud06)}
              {renderSection("2. Super Deluxe", data.salesSuperDeluxe)}
              {renderSection("3. Super Deluxe Merah", data.salesSuperDeluxeRed || [])}
              {renderSection("4. Padud 98", data.salesPadud98 || [])}
              {renderSection("5. Padud 98 Merah", data.salesPadud98Red || [])}
              {renderSection("6. Primavera", data.salesPrimavera || [])}
            </div>

            {/* B. TARGET PENJUALAN SALES */}
            <div>
              <h3 className="text-md font-bold text-green-600 mb-3">B. TARGET PENJUALAN SALES</h3>
              {renderSection("Target Sales", data.salesTargets || [])}
            </div>

            {/* C. PENJUALAN SALES */}
            <div>
              <h3 className="text-md font-bold text-green-600 mb-3">C. PENJUALAN SALES</h3>
              {renderSection("Realisasi Sales", data.salesRealization || [])}
            </div>

            {/* D. RETUR/POTONGAN PENJUALAN */}
            <div>
              <h3 className="text-md font-bold text-green-600 mb-3">D. RETUR/POTONGAN PENJUALAN</h3>
              {renderSection("Retur & Potongan", data.salesReturns || [])}
            </div>

            {/* E. KENDALA PENJUALAN */}
            <div>
              <h3 className="text-md font-bold text-green-600 mb-3">E. KENDALA PENJUALAN</h3>
              {data.salesObstacles && data.salesObstacles.length > 0 && (
                <div className="ml-4">
                  {data.salesObstacles.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {index + 1}. {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // DIVISI PRODUKSI
  if (division === "Produksi") {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader className="bg-orange-50 border-b text-center py-4">
          <h2 className="text-lg font-bold text-gray-900">LAPORAN HARIAN</h2>
          <h3 className="text-md font-semibold text-orange-600">DIVISI PRODUKSI</h3>
          <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(date)}</p>
        </CardHeader>
        <CardContent className="p-4 max-h-[600px] overflow-y-auto text-sm">
          <div className="space-y-6">
            {/* A. HASIL PRODUKSI HARIAN */}
            <div>
              <h3 className="text-md font-bold text-orange-600 mb-3">A. HASIL PRODUKSI HARIAN</h3>
              {renderSection("Hasil Produksi", data.actualProduction, false, "Pcs")}
            </div>

            {/* B. BARANG GAGAL/CACAT PRODUKSI */}
            <div>
              <h3 className="text-md font-bold text-orange-600 mb-3">B. BARANG GAGAL/CACAT PRODUKSI</h3>
              {renderSection("Barang Cacat", data.defectiveProducts, false, "Pcs")}
            </div>

            {/* C. STOCK BARANG JADI */}
            <div>
              <h3 className="text-md font-bold text-orange-600 mb-3">C. STOCK BARANG JADI</h3>
              {renderSection("Stock Barang Jadi", data.finishedGoodsStock || [], false, "Pcs")}
            </div>

            {/* D. HP BARANG JADI */}
            <div>
              <h3 className="text-md font-bold text-orange-600 mb-3">D. HP BARANG JADI</h3>
              {renderSection("HP Barang Jadi", data.finishedGoodsHP || [])}
            </div>

            {/* E. KENDALA PRODUKSI */}
            <div>
              <h3 className="text-md font-bold text-orange-600 mb-3">E. KENDALA PRODUKSI</h3>
              {data.productionObstacles && data.productionObstacles.length > 0 && (
                <div className="ml-4">
                  {data.productionObstacles.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {index + 1}. {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // DIVISI DISTRIBUSI & GUDANG
  if (division === "Distribusi & Gudang") {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader className="bg-purple-50 border-b text-center py-4">
          <h2 className="text-lg font-bold text-gray-900">LAPORAN HARIAN</h2>
          <h3 className="text-md font-semibold text-purple-600">DIVISI DISTRIBUSI & GUDANG</h3>
          <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(date)}</p>
        </CardHeader>
        <CardContent className="p-4 max-h-[600px] overflow-y-auto text-sm">
          <div className="space-y-6">
            {/* A. STOCK BAHAN BAKU AWAL */}
            <div>
              <h3 className="text-md font-bold text-purple-600 mb-3">A. STOCK BAHAN BAKU AWAL</h3>
              {renderSection("Stock Awal", data.initialRawMaterialStock || [], false, "Kg")}
            </div>

            {/* B. PEMAKAIAN */}
            <div>
              <h3 className="text-md font-bold text-purple-600 mb-3">B. PEMAKAIAN</h3>
              {renderSection("Pemakaian Bahan Baku", data.rawMaterialUsage || [], false, "Kg")}
            </div>

            {/* C. STOCK BAHAN BAKU AKHIR */}
            <div>
              <h3 className="text-md font-bold text-purple-600 mb-3">C. STOCK BAHAN BAKU AKHIR</h3>
              {renderSection("Stock Akhir", data.finalRawMaterialStock || [], false, "Kg")}
            </div>

            {/* D. KONDISI GUDANG */}
            <div>
              <h3 className="text-md font-bold text-purple-600 mb-3">D. KONDISI GUDANG</h3>
              {data.warehouseCondition && data.warehouseCondition.length > 0 && (
                <div className="ml-4">
                  {data.warehouseCondition.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {index + 1}. {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // DIVISI HRD
  if (division === "HRD") {
    return (
      <Card className={`h-full ${className}`}>
        <CardHeader className="bg-red-50 border-b text-center py-4">
          <h2 className="text-lg font-bold text-gray-900">LAPORAN HARIAN</h2>
          <h3 className="text-md font-semibold text-red-600">DIVISI HRD</h3>
          <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(date)}</p>
        </CardHeader>
        <CardContent className="p-4 max-h-[600px] overflow-y-auto text-sm">
          <div className="space-y-6">
            {/* A. KARYAWAN HADIR */}
            <div>
              <h3 className="text-md font-bold text-red-600 mb-3">A. KARYAWAN HADIR</h3>
              {renderSection("Kehadiran", data.attendance, false, "Orang")}
            </div>

            {/* B. KARYAWAN TIDAK HADIR */}
            <div>
              <h3 className="text-md font-bold text-red-600 mb-3">B. KARYAWAN TIDAK HADIR</h3>
              {renderSection("Ketidakhadiran", data.absentEmployees, false, "Orang")}
            </div>

            {/* C. CATATAN PELANGGARAN KARYAWAN */}
            <div>
              <h3 className="text-md font-bold text-red-600 mb-3">C. CATATAN PELANGGARAN KARYAWAN</h3>
              {data.employeeViolations && data.employeeViolations.length > 0 && (
                <div className="ml-4">
                  {data.employeeViolations.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {index + 1}. {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* D. KESEHATAN & KECELAKAAN KERJA (K3) */}
            <div>
              <h3 className="text-md font-bold text-red-600 mb-3">D. KESEHATAN & KECELAKAAN KERJA (K3)</h3>
              {data.healthSafety && data.healthSafety.length > 0 && (
                <div className="ml-4">
                  {data.healthSafety.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {index + 1}. {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* E. KENDALA KARYAWAN */}
            <div>
              <h3 className="text-md font-bold text-red-600 mb-3">E. KENDALA KARYAWAN</h3>
              {data.employeeObstacles && data.employeeObstacles.length > 0 && (
                <div className="ml-4">
                  {data.employeeObstacles.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {index + 1}. {item.description}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default preview
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="bg-gray-50 border-b text-center py-4">
        <h2 className="text-lg font-bold text-gray-900">LAPORAN HARIAN</h2>
        <h3 className="text-md font-semibold text-blue-600">{division.toUpperCase()}</h3>
        <p className="text-sm text-gray-600 mt-1">Tanggal: {formatDate(date)}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center text-gray-500">
          <p>Preview akan muncul saat Anda mulai mengisi data</p>
        </div>
      </CardContent>
    </Card>
  )
}
