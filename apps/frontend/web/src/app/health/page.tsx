'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp?: string;
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/health`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHealthData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Health</h1>
          <p className="text-xl text-gray-600">
            Backend API connectivity status
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {!loading && healthData && <CheckCircle className="mr-2 h-5 w-5 text-green-600" />}
                {!loading && error && <XCircle className="mr-2 h-5 w-5 text-red-600" />}
                API Health Check
              </CardTitle>
              <CardDescription>
                Real-time backend service status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <p className="text-gray-600">Checking backend status...</p>
              )}
              
              {error && (
                <div className="text-red-600">
                  <p className="font-medium">Connection Error</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
              
              {healthData && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600 capitalize">{healthData.status}</span>
                  </div>
                  {healthData.timestamp && (
                    <div className="flex justify-between">
                      <span className="font-medium">Timestamp:</span>
                      <span className="text-gray-600 text-sm">{healthData.timestamp}</span>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-gray-700">
                      {JSON.stringify(healthData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}