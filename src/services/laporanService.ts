// Lokasi File: src/lib/laporan.service.ts (disarankan ganti nama file)

import { apiRequest } from "@/lib/api";
import type { LaporanHarianResponse, LaporanHarianRequest } from "@/types/api"; // Asumsi tipe ini ada di src/types/api.d.ts

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
  getAllLaporan: async (): Promise<LaporanHarianResponse[]> => {
    return await apiRequest("/v1/laporan/semua");
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
    return await apiRequest(`/v1/laporan/${id}`);
  },
};
