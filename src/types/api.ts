// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    name: string;
  };
}

export interface User {
  id: string;
  username: string;
  role: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Laporan Harian Types
export interface RincianLaporan {
  rincianId?: string;
  kategoriUtama: string;
  kategoriSub?: string | null;
  keterangan: string;
  nilaiKuantitas?: number | null;
  satuan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaporanHarianRequest {
  tanggalLaporan: string;
  rincian: {
    kategoriUtama: string;
    kategoriSub?: string | null;
    keterangan: string;
    nilaiKuantitas?: number | null;
    satuan?: string;
  }[];
}

export interface LaporanHarianResponse {
  laporanId: string;
  tanggalLaporan: string;
  divisi: string;
  namaUser: string;
  submittedBy?: string; // Add this for super admin compatibility
  rincian: RincianLaporan[];
  createdAt?: string;
  updatedAt?: string;
}

// Generic Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
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
