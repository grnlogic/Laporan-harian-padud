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

    // Simulate authentication
    setTimeout(() => {
      // Check registered users first
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const registeredUser = registeredUsers.find(
        (user: any) => user.username === username && user.password === password
      );

      if (registeredUser) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", registeredUser.fullName);
        localStorage.setItem("userDivision", registeredUser.division);

        // Route to new dynamic pages based on division
        switch (registeredUser.division) {
          case "keuangan":
            router.push("/admin/keuangan");
            break;
          case "produksi":
            router.push("/admin/produksi");
            break;
          case "pemasaran":
            router.push("/admin/pemasaran");
            break;
          case "gudang":
            router.push("/admin/gudang");
            break;
          case "hrd":
            router.push("/admin/hrd");
            break;
          default:
            router.push("/admin/keuangan");
        }
      } else {
        // Fallback to demo accounts
        if (username === "superadmin" && password === "admin123") {
          localStorage.setItem("userRole", "superadmin");
          localStorage.setItem("userName", "Super Administrator");
          router.push("/super-admin");
        } else if (username === "produksi" && password === "prod123") {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userName", "Admin Produksi");
          localStorage.setItem("userDivision", "Produksi");
          router.push("/admin/produksi");
        } else if (username === "keuangan" && password === "keu123") {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userName", "Admin Keuangan");
          localStorage.setItem("userDivision", "Keuangan");
          router.push("/admin/keuangan");
        } else if (username === "pemasaran" && password === "market123") {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userName", "Admin Pemasaran");
          localStorage.setItem("userDivision", "Pemasaran");
          router.push("/admin/pemasaran");
        } else if (username === "gudang" && password === "gudang123") {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userName", "Admin Gudang");
          localStorage.setItem("userDivision", "Distribusi & Gudang");
          router.push("/admin/gudang");
        } else if (username === "hrd" && password === "hrd123") {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userName", "Admin HRD");
          localStorage.setItem("userDivision", "HRD");
          router.push("/admin/hrd");
        } else {
          setError("Username atau password salah. Silakan coba lagi.");
        }
      }
      setIsLoading(false);
    }, 1000);
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

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Demo Credentials:
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Super Admin:</strong> superadmin / admin123
                </p>
                <p>
                  <strong>Keuangan:</strong> keuangan / keu123
                </p>
                <p>
                  <strong>Produksi:</strong> produksi / prod123
                </p>
                <p>
                  <strong>Pemasaran:</strong> pemasaran / market123
                </p>
                <p>
                  <strong>HRD:</strong> hrd / hrd123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function loadSavedReports() {
  throw new Error("Function not implemented.");
}

