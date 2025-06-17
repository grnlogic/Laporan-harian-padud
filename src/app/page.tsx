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
import CompanyLogo from "@/assets/Adobe Express - file.png";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        {/* Header dengan Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Ganti icon gedung dengan logo perusahaan */}
            <Image
              src={CompanyLogo}
              alt="Padud Jaya Putera Logo"
              width={80}
              height={80}
              className="rounded-full bg-gray-100 p-2"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            CV. PADUD JAYA PUTERA
          </h1>
          <p className="text-gray-600">Sistem Laporan Harian</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-11 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Masuk...</span>
              </div>
            ) : (
              "Masuk"
            )}
          </Button>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Daftar di sini
              </Link>
            </p>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-red-600 hover:text-red-500 font-medium underline transition-colors duration-200"
            >
              Lupa Password? Butuh Bantuan?
            </button>
          </div>

          {/* Status System Dropdown - Enhanced with smooth animations */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowStatus(!showStatus)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99] group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Status Sistem
              </span>
              <div className={`transform transition-all duration-300 ease-in-out ${showStatus ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
              </div>
            </button>

            {/* Dropdown Content with smooth slide animation */}
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${showStatus 
                ? 'max-h-96 opacity-100 mt-2' 
                : 'max-h-0 opacity-0 mt-0'
              }
            `}>
              <div className={`
                p-4 bg-gray-50 rounded-lg border transform transition-all duration-300 ease-in-out
                ${showStatus 
                  ? 'translate-y-0 scale-100' 
                  : '-translate-y-2 scale-95'
                }
              `}>
                <StatusIndicator />
              </div>
            </div>
          </div>

          {/* Info untuk testing - Enhanced styling */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 transform transition-all duration-200 hover:scale-[1.01]">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Info Penggunaan:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                <span>Gunakan akun yang sudah didaftarkan</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                <span>Sistem akan otomatis mengarahkan sesuai role dan divisi</span>
              </li>
            </ul>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
