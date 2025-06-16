"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Building2, UserPlus } from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    division: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const divisions = [
    { value: "Keuangan", label: "Divisi Keuangan & Administrasi" },
    { value: "Pemasaran", label: "Divisi Pemasaran & Penjualan" },
    { value: "Produksi", label: "Divisi Produksi" },
    { value: "Distribusi & Gudang", label: "Divisi Distribusi & Gudang" },
    { value: "HRD", label: "Divisi HRD" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    if (
      !formData.fullName ||
      !formData.username ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.division
    ) {
      setError("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      // Fungsi kecil untuk menerjemahkan nama divisi ke format Role Backend
      const mapDivisionToRoleEnum = (division: string): string => {
        switch (division.toLowerCase()) {
          case "keuangan":
            return "ROLE_KEUANGAN";
          case "pemasaran":
            return "ROLE_PEMASARAN";
          case "produksi":
            return "ROLE_PRODUKSI";
          case "distribusi & gudang":
            return "ROLE_GUDANG";
          case "hrd":
            return "ROLE_HRD";
          default:
            throw new Error("Divisi tidak valid");
        }
      };

      const roleForBackend = mapDivisionToRoleEnum(formData.division);

      // Panggil API register ke backend dengan data yang sudah benar
      await authService.register({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        role: roleForBackend, // Mengirim role yang sudah diterjemahkan
      });

      setSuccess("Registrasi berhasil! Anda akan diarahkan ke halaman login.");

      // Reset form
      setFormData({
        fullName: "",
        username: "",
        password: "",
        confirmPassword: "",
        division: "",
      });

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(
        error.message || "Registrasi gagal. Username mungkin sudah digunakan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PADUD JAYA</h1>
          <p className="text-lg text-gray-600">Sistem Laporan Harian</p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center">
              <UserPlus className="h-6 w-6 mr-2" />
              Registrasi Akun Baru
            </CardTitle>
            <CardDescription className="text-center">
              Daftarkan akun Anda untuk mengakses sistem laporan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Buat Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Buat Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password (min. 6 karakter)"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="division">Pilih Divisi/Role</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value) =>
                    handleInputChange("division", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Pilih divisi Anda" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((division) => (
                      <SelectItem key={division.value} value={division.value}>
                        {division.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Mendaftar..." : "Daftar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            {/* Info untuk development */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Info Registrasi:
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Data akan disimpan ke database melalui API backend</p>
                <p>• Username harus unik</p>
                <p>• Role otomatis diset sebagai ADMIN</p>
                <p>• Setelah berhasil, akan diarahkan ke halaman login</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
