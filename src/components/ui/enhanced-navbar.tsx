import React from 'react';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';
// Import logo perusahaan
import CompanyLogo from '@/assets/Adobe Express - file.png';

interface EnhancedNavbarProps {
  userName: string;
  currentDate: string;
  onLogout: () => void;
  title: string;
  divisionColor: string;
}

export default function EnhancedNavbar({
  userName,
  currentDate,
  onLogout,
  title,
  divisionColor,
}: EnhancedNavbarProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600',
  };

  return (
    <nav className={`${colorClasses[divisionColor as keyof typeof colorClasses]} text-white shadow-lg`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo dan Title */}
          <div className="flex items-center space-x-3">
            {/* Ganti icon gedung dengan logo perusahaan */}
            <div className="flex-shrink-0">
              <Image
                src={CompanyLogo}
                alt="Padud Jaya Putera Logo"
                width={40}
                height={40}
                className="rounded-full bg-white p-1"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">CV. PADUD JAYA PUTERA</h1>
              <p className="text-sm opacity-90">Sistem Laporan Harian - {title}</p>
            </div>
          </div>

          {/* User Info dan Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs opacity-75">{currentDate}</p>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}