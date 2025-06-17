// Lokasi File: src/lib/laporan.service.ts (disarankan ganti nama file)

import { apiRequest } from '@/lib/api';
import { LaporanHarianResponse, LaporanHarianRequest, PaginationParams } from '@/types/api';

export interface LaporanFilter extends PaginationParams {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  kategoriUtama?: string;
  kategoriSub?: string;
  userId?: string;
  satuan?: string;
}

export const laporanService = {
  /**
   * Mengambil semua laporan milik pengguna yang sedang login.
   * @returns Promise<LaporanHarianResponse[]>
   */
  getMyLaporan: async (): Promise<LaporanHarianResponse[]> => {
    return await apiRequest("/v1/laporan/saya");
  },

  /**
   * Mengambil semua laporan dari semua pengguna (hanya untuk Super Admin).
   * @returns Promise<LaporanHarianResponse[]>
   */
  getAllLaporan: async (filters: LaporanFilter = {}): Promise<LaporanHarianResponse[]> => {
    try {
      console.log("🔄 Calling getAllLaporan using existing endpoint...");
      
      // GUNAKAN apiRequest yang sudah ada dengan endpoint /v1/laporan/semua
      const response = await apiRequest('/v1/laporan/semua');
      
      console.log("✅ API Response:", response);
      console.log("📊 Number of reports received:", response?.length || 0);
      
      // Jika response adalah array langsung
      if (Array.isArray(response)) {
        return response;
      }
      
      // Jika response dibungkus dalam object dengan property data
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Jika response success tapi data kosong
      if (response && response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      console.log("⚠️ Unexpected response format:", response);
      return [];
      
    } catch (error) {
      console.error("❌ Error in getAllLaporan:", error);
      throw error;
    }
  },

  /**
   * Membuat laporan harian baru.
   * @param payload - Data laporan yang akan dibuat
   * @returns Promise<string> - Pesan sukses dari server
   */
  createLaporan: async (payload: LaporanHarianRequest): Promise<string> => {
    try {
      // Endpoint create kita di backend mengembalikan pesan string, bukan objek JSON
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/laporan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal membuat laporan");
      }
      return await response.text(); // Mengambil respons sebagai teks
    } catch (error) {
      console.error("Error saat membuat laporan:", error);
      throw error;
    }
  },

  /**
   * Memperbarui laporan yang sudah ada.
   * @param id - ID dari laporan yang akan diupdate
   * @param payload - Data baru untuk laporan
   * @returns Promise<string> - Pesan sukses dari server
   */
  updateLaporan: async (
    id: number,
    payload: LaporanHarianRequest
  ): Promise<string> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/laporan/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui laporan");
      }
      return await response.text();
    } catch (error) {
      console.error(`Error saat update laporan ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Menghapus laporan berdasarkan ID.
   * @param id - ID dari laporan yang akan dihapus
   * @returns Promise<string> - Pesan sukses dari server
   */
  deleteLaporan: async (id: number): Promise<string> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/laporan/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal menghapus laporan");
      }
      return await response.text();
    } catch (error) {
      console.error(`Error saat hapus laporan ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mengambil laporan berdasarkan ID tertentu.
   * @param id - ID dari laporan yang akan diambil
   * @returns Promise<LaporanHarianResponse> - Objek laporan yang diminta
   */
  getLaporanById: async (id: number): Promise<LaporanHarianResponse> => {
    try {
      console.log("🔄 Getting laporan by ID:", id);
      const response = await apiRequest(`/v1/laporan/${id}`);
      
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error("❌ Error getting laporan by ID:", error);
      throw error;
    }
  },

  /**
   * Mengambil opsi filter untuk laporan.
   * @returns Promise<any> - Opsi filter yang tersedia
   */
  getFilterOptions: async () => {
    return await apiRequest("/v1/laporan/filter-options");
  },
};
