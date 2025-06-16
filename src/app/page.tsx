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
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Building2, UserPlus } from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!username || !password) {
      setError("Username dan Password tidak boleh kosong.");
      setIsLoading(false);
      return;
    }

    try {
      // Login menggunakan API backend
      const response = await authService.login(username, password);

      // DEBUG: Lihat apa yang diterima dari backend
      console.log("🔍 Response dari backend:", response);
      console.log("🔍 Role yang diterima:", response.role);

      // Simpan token dan data user ke localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userRole", response.role);
      localStorage.setItem("userName", response.fullName);
      localStorage.setItem("userDivision", response.division);
      localStorage.setItem("userId", response.userId);

      // DEBUG: Cek apa yang disimpan di localStorage
      console.log("💾 Data tersimpan di localStorage:");
      console.log("authToken:", localStorage.getItem("authToken"));
      console.log("userRole:", localStorage.getItem("userRole"));
      console.log("userName:", localStorage.getItem("userName"));

      // Routing berdasarkan role
      console.log("🚀 Mulai routing...");
      
      if (response.role === "ROLE_SUPERADMIN") {
        console.log("✅ Redirect ke super-admin");
        router.push("/super-admin");
      } else {
        console.log("🔄 Role bukan SUPERADMIN, cek role lain...");
        // Route berdasarkan role untuk admin biasa
        switch (response.role) {
          case "ROLE_KEUANGAN":
            console.log("✅ Redirect ke admin/keuangan");
            router.push("/admin/keuangan");
            break;
          case "ROLE_PRODUKSI":
            console.log("✅ Redirect ke admin/produksi");
            router.push("/admin/produksi");
            break;
          case "ROLE_PEMASARAN":
            console.log("✅ Redirect ke admin/pemasaran");
            router.push("/admin/pemasaran");
            break;
          case "ROLE_GUDANG":
            console.log("✅ Redirect ke admin/gudang");
            router.push("/admin/gudang");
            break;
          case "ROLE_HRD":
            console.log("✅ Redirect ke admin/hrd");
            router.push("/admin/hrd");
            break;
          default:
            console.log("⚠️ Role tidak dikenal, redirect ke default");
            router.push("/admin/keuangan");
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Username atau password salah. Silakan coba lagi.");
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

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Masuk ke Sistem
            </CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial Anda untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  <UserPlus className="h-4 w-4 inline mr-1" />
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Info untuk testing */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Info Penggunaan:
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  • Gunakan akun yang sudah didaftarkan melalui endpoint register
                </p>
                <p>• Atau daftar akun baru melalui halaman registrasi</p>
                <p>• Sistem akan otomatis mengarahkan sesuai role dan divisi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

