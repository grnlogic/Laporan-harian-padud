export interface LaporanHarianResponse {
  laporanId: number;
  submittedBy: string;
  divisi: string;
  tanggalLaporan: string;
  rincian: RincianData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LaporanHarianRequest {
  tanggalLaporan: string;
  rincian: RincianRequest[];
}

export interface RincianData {
  rincianId?: number;
  kategoriUtama: string;
  kategoriSub?: string;
  keterangan: string;
  nilaiKuantitas?: number;
  satuan?: string;
}

export interface RincianRequest {
  kategoriUtama: string;
  kategoriSub?: string | null;
  keterangan: string;
  nilaiKuantitas?: number | null;
  satuan?: string;
}

// Legacy type for compatibility (if needed)
export interface LaporanData {
  id: string;
  date: string;
  division: string;
  responsible: string;
  key1: string;
  key2: string;
  status: "completed" | "pending" | "late";
}

// Auth response types
export interface LoginResponse {
  token: string;
  role: string;
  fullName: string;
  division: string;
  userId: string;
}

export interface RegisterResponse {
  message: string;
}

// Tambahan untuk Keuangan
export interface FinanceFormData {
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

export interface FormRow {
  id: string;
  description: string;
  amount: number;
}
