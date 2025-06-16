"use client";

import React, { useState, useEffect } from 'react';
import { healthService } from '@/lib/api';
import { RefreshCw, Database, Server, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface StatusData {
  status: string;
  database: {
    status: string;
    database?: string;
    version?: string;
    error?: string;
    query_test?: string;
  };
  application: string;
  timestamp: string;
  version?: string;
}

export function StatusIndicator() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const healthStatus = await healthService.getStatus();
      setStatus(healthStatus);
      setLastChecked(new Date());
    } catch (err: any) {
      console.error('Status check failed:', err);
      setError(err.message || 'Connection failed');
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
      case 'UP': return 'text-green-600 bg-green-100 border-green-200';
      case 'DOWN': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP': return <CheckCircle className="h-4 w-4" />;
      case 'DOWN': return <AlertCircle className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
  };

  const overallStatus = status?.status || 'DOWN';
  const isSystemHealthy = overallStatus === 'UP';

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Status Sistem</h3>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(overallStatus)}`}>
            {getStatusIcon(overallStatus)}
            <span className="ml-1">{overallStatus}</span>
          </div>
        </div>
        <button
          onClick={checkStatus}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Details */}
      <div className="space-y-3">
        {/* Backend Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Backend API</span>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status?.application || 'DOWN')}`}>
            {getStatusIcon(status?.application || 'DOWN')}
            <span className="ml-1">{status?.application || 'DOWN'}</span>
          </div>
        </div>

        {/* Database Status */}
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

        {/* Database Details */}
        {status?.database?.database && (
          <div className="text-xs text-gray-500 pl-6 space-y-1">
            <div>{status.database.database} {status.database.version}</div>
            {status.database.query_test && (
              <div className="flex items-center space-x-1">
                <span>Query Test:</span>
                <span className={`font-medium ${status.database.query_test === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                  {status.database.query_test}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Messages */}
        {(error || status?.database?.error) && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            <div className="font-medium">Error:</div>
            <div>{error || status?.database?.error}</div>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isSystemHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-600">
              {isSystemHealthy ? 'Sistem Online' : 'Sistem Offline'}
            </span>
          </div>
          {lastChecked && (
            <div className="text-xs text-gray-400">
              {lastChecked.toLocaleTimeString('id-ID')}
            </div>
          )}
        </div>

        {/* Version Info */}
        {status?.version && (
          <div className="text-xs text-gray-500 text-center">
            API v{status.version}
          </div>
        )}
      </div>
    </div>
  );
}