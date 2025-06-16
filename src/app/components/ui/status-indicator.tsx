"use client";

import React, { useState, useEffect } from 'react';
import { healthService } from '@/lib/api';
import { RefreshCw, Database, Server, Wifi, WifiOff } from 'lucide-react';

interface StatusData {
  status: string;
  database: {
    status: string;
    database?: string;
    error?: string;
  };
  application: string;
  timestamp: string;
}

export function StatusIndicator() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const healthStatus = await healthService.getStatus();
      setStatus(healthStatus);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus({
        status: 'DOWN',
        database: { status: 'DOWN', error: 'Connection failed' },
        application: 'DOWN',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Auto refresh setiap 30 detik
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UP': return 'text-green-600 bg-green-100';
      case 'DOWN': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP': return <Wifi className="h-4 w-4" />;
      case 'DOWN': return <WifiOff className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Status Sistem</h3>
        <button
          onClick={checkStatus}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {/* Status Backend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Backend</span>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status?.application || 'DOWN')}`}>
            {getStatusIcon(status?.application || 'DOWN')}
            <span className="ml-1">{status?.application || 'DOWN'}</span>
          </div>
        </div>

        {/* Status Database */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Database</span>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status?.database?.status || 'DOWN')}`}>
            {getStatusIcon(status?.database?.status || 'DOWN')}
            <span className="ml-1">{status?.database?.status || 'DOWN'}</span>
          </div>
        </div>

        {/* Database Info */}
        {status?.database?.database && (
          <div className="text-xs text-gray-500 pl-6">
            {status.database.database}
          </div>
        )}

        {/* Error Message */}
        {status?.database?.error && (
          <div className="text-xs text-red-600 pl-6 bg-red-50 p-2 rounded">
            {status.database.error}
          </div>
        )}

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-xs text-gray-400 text-center pt-2 border-t">
            Terakhir dicek: {lastChecked.toLocaleTimeString('id-ID')}
          </div>
        )}
      </div>
    </div>
  );
}