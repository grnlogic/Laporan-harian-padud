"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { MessageCircle, X } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [formData, setFormData] = useState({
    nama: "",
    divisi: "",
    kendala: "",
    detail: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.nama || !formData.kendala) {
      alert("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    // Format pesan WhatsApp
    const message = `*LAPORAN KENDALA SISTEM*

👤 *Nama:* ${formData.nama}
🏢 *Divisi:* ${formData.divisi || "Tidak disebutkan"}
⚠️ *Jenis Kendala:* ${getKendalaText(formData.kendala)}
📝 *Detail:* ${formData.detail || "Tidak ada detail tambahan"}

Mohon bantuan untuk menyelesaikan kendala ini. Terima kasih.`;

    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/6281395195039?text=${encodedMessage}`;

    // Buka WhatsApp
    window.open(whatsappUrl, "_blank");

    // Reset form dan tutup modal
    setFormData({ nama: "", divisi: "", kendala: "", detail: "" });
    onClose();
  };

  const getKendalaText = (value: string) => {
    const kendalaMap: Record<string, string> = {
      "lupa-password": "Lupa Password",
      "akun-terkunci": "Akun Terkunci",
      "email-tidak-bisa": "Email Tidak Bisa Login",
      "tidak-bisa-akses": "Tidak Bisa Akses Sistem",
      "error-sistem": "Error Pada Sistem",
      lainnya: "Kendala Lainnya",
    };
    return kendalaMap[value] || value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">Bantuan & Lupa Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Isi formulir di bawah ini untuk mendapatkan bantuan melalui WhatsApp
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => handleInputChange("nama", e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="divisi">Divisi</Label>
              <select
                id="divisi"
                value={formData.divisi}
                onChange={(e) => handleInputChange("divisi", e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Pilih divisi Anda</option>
                <option value="keuangan">Keuangan</option>
                <option value="produksi">Produksi</option>
                <option value="pemasaran">Pemasaran</option>
                <option value="gudang">Gudang</option>
                <option value="hrd">HRD</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kendala">Jenis Kendala *</Label>
              <select
                id="kendala"
                value={formData.kendala}
                onChange={(e) => handleInputChange("kendala", e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Pilih jenis kendala</option>
                <option value="lupa-password">Lupa Password</option>
                <option value="akun-terkunci">Akun Terkunci</option>
                <option value="email-tidak-bisa">Email Tidak Bisa Login</option>
                <option value="tidak-bisa-akses">
                  Tidak Bisa Akses Sistem
                </option>
                <option value="error-sistem">Error Pada Sistem</option>
                <option value="lainnya">Kendala Lainnya</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">Detail Kendala (Opsional)</Label>
              <textarea
                id="detail"
                value={formData.detail}
                onChange={(e) => handleInputChange("detail", e.target.value)}
                placeholder="Jelaskan kendala Anda lebih detail..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
              />
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Kirim ke WhatsApp
              </Button>
            </div>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Anda akan diarahkan ke WhatsApp untuk mengirim pesan bantuan
          </p>
        </div>
      </div>
    </div>
  );
}
