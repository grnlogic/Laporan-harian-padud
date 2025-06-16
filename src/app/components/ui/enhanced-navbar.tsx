"use client"

import { Button } from "@/components/ui/button"
import { Building2, LogOut, Bell, Settings, User, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EnhancedNavbarProps {
  title: string
  userName: string
  currentDate: string
  onLogout: () => void
  divisionColor?: string
}

export function EnhancedNavbar({
  title,
  userName,
  currentDate,
  onLogout,
  divisionColor = "blue",
}: EnhancedNavbarProps) {
  const colorClasses = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    orange: "from-orange-600 to-orange-700",
    purple: "from-purple-600 to-purple-700",
    red: "from-red-600 to-red-700",
  }

  return (
    <nav className={`bg-gradient-to-r ${colorClasses[divisionColor as keyof typeof colorClasses]} shadow-lg border-b`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">PADUD JAYA</span>
              <div className="text-xs text-white/80">Sistem Laporan Harian</div>
            </div>
          </div>

          {/* Center Title */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <Calendar className="h-4 w-4 text-white/80" />
              <p className="text-sm text-white/90">{currentDate}</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Bell className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20 space-x-2">
                  <div className="bg-white/20 p-1 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
