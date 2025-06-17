'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Download, Calendar, User, Building, X } from 'lucide-react';
import { LaporanHarianResponse, RincianLaporan } from '@/types/api';

interface LaporanPreviewProps {
  laporan: LaporanHarianResponse | null;
  open: boolean;
  onClose: () => void;
}

export default function LaporanPreview({ laporan, open, onClose }: LaporanPreviewProps) {
  if (!laporan) return null;

  const handleExportPDF = () => {
    console.log('Export PDF untuk laporan:', laporan.laporanId);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatNumber = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group rincian by kategori utama dengan type safety
  const groupedRincian = laporan.rincian.reduce((acc, item) => {
    const key = item.kategoriUtama;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, RincianLaporan[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Preview Laporan Harian</span>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={onClose} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-medium">
                      {formatDate(laporan.tanggalLaporan)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pelapor</p>
                    <p className="font-medium">{laporan.namaUser}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Divisi</p>
                    <p className="font-medium">{laporan.divisi}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total Item</p>
                  <p className="font-medium">{laporan.rincian.length} item</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rincian per Kategori */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rincian Laporan</h3>
            
            {Object.entries(groupedRincian).map(([kategori, items]) => (
              <Card key={kategori}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">{kategori}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ({items.length} item)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground">Sub Kategori</p>
                            <p className="font-medium">
                              {item.kategoriSub || '-'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Keterangan</p>
                            <p className="font-medium">{item.keterangan}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground">Nilai & Satuan</p>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {item.satuan === 'IDR' 
                                  ? formatCurrency(item.nilaiKuantitas)
                                  : formatNumber(item.nilaiKuantitas)
                                }
                              </span>
                              {item.satuan && item.satuan !== 'IDR' && (
                                <Badge variant="outline" className="text-xs">
                                  {item.satuan}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {index < items.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Kategori</p>
                  <p className="text-2xl font-bold">
                    {Object.keys(groupedRincian).length}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Total Item</p>
                  <p className="text-2xl font-bold">
                    {laporan.rincian.length}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Dibuat</p>
                  <p className="font-medium">
                    {laporan.createdAt 
                      ? new Date(laporan.createdAt).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Terakhir Update</p>
                  <p className="font-medium">
                    {laporan.updatedAt 
                      ? new Date(laporan.updatedAt).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}