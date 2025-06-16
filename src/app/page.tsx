"use client";

import { StatusIndicator } from "./components/ui/status-indicator";
import { ForgotPasswordModal } from "./components/ui/forgot-password-modal";
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
import { UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { authService } from "@/lib/api";
import Image from "next/image";
import Logo from "../assets/Adobe Express - file.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
      <div className="max-w-md w-full space-y-8">
        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {/* Menggunakan logo perusahaan dari assets */}
              <div className="bg-white p-2 rounded-full shadow-lg">
                <Image
                  src={Logo}
                  alt="PADUD JAYA Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PADUD JAYA
            </h1>
            <p className="text-lg text-gray-600">Sistem Laporan Harian</p>
          </div>

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
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Masuk..." : "Masuk"}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Daftar di sini
                  </Link>
                </p>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-red-600 hover:text-red-500 font-medium underline"
                >
                  Lupa Password? Butuh Bantuan?
                </button>
              </div>

              {/* Status System Dropdown */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowStatus(!showStatus)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Status Sistem
                  </span>
                  {showStatus ? (
                    <ChevronUp className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  )}
                </button>

                {showStatus && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    <StatusIndicator />
                  </div>
                )}
              </div>

              {/* Info untuk testing */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Info Penggunaan:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Gunakan akun yang sudah didaftarkan</li>
                  <li>
                    • Sistem akan otomatis mengarahkan sesuai role dan divisi
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
