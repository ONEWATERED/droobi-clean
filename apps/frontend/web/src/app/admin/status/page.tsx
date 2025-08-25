'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Server, 
  Code, 
  Flag, 
  Database, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock
} from 'lucide-react';

interface VersionInfo {
  service: string;
  version: string;
  sha: string;
  node?: string;
}

interface AdminStatus {
  service: string;
  version: string;
  sha: string;
  node: string;
  pid: number;
  uptimeSec: number;
  envName: string;
  dataNs: string;
  health: {
    status: string;
    ready: boolean;
  };
  flags: Record<string, boolean>;
  counts: {
    lexicon: number;
    directory: number;
    webinars: number;
    videos: number;
    trainings: number;
    projects: number;
    communityPosts: number;
  };
}

export default function AdminStatusPage() {
  const [webVersion, setWebVersion] = useState<VersionInfo | null>(null);
  const [apiStatus, setApiStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  useEffect(() => {
    if (!isAdminMode) {
      setLoading(false);
      return;
    }
    
    fetchData();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAdminMode]);

  useEffect(() => {
    if (autoRefresh && isAdminMode) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, 10000); // 10 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isAdminMode]);

  const fetchData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setRefreshing(true);
    }
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch web version
      const webVersionResponse = await fetch('/api/version');
      if (webVersionResponse.ok) {
        const webVersionData = await webVersionResponse.json();
        setWebVersion(webVersionData);
      }
      
      // Fetch API status
      const apiStatusResponse = await fetch(`${baseUrl}/admin/status`);
      if (apiStatusResponse.ok) {
        const apiStatusData = await apiStatusResponse.json();
        setApiStatus(apiStatusData);
      } else {
        throw new Error(`API status: HTTP ${apiStatusResponse.status}`);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleCopyJson = async () => {
    if (!apiStatus) return;
    
    try {
      const jsonData = {
        web: webVersion,
        api: apiStatus,
        timestamp: new Date().toISOString()
      };
      
      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getHealthIcon = (status: string, ready: boolean) => {
    if (status === 'ok' && ready) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getHealthColor = (status: string, ready: boolean) => {
    if (status === 'ok' && ready) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  if (!isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-xl text-gray-600 mb-8">
              Admin mode is required to access this page.
            </p>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading admin status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time monitoring of API health, build information, and content metrics
          </p>
        </div>

        {/* Controls */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <Label htmlFor="auto-refresh" className="text-sm">
                      Auto-refresh (10s)
                    </Label>
                  </div>
                  
                  <Button
                    onClick={handleCopyJson}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </Button>
                </div>

                {process.env.SENTRY_DSN && (
                  <a
                    href={`https://sentry.io/organizations/${process.env.SENTRY_ORG}/projects/${process.env.SENTRY_PROJECT}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Sentry
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="max-w-6xl mx-auto mb-8">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600">
                  <XCircle className="mr-2 h-5 w-5" />
                  <span>Error: {error}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  API Health
                </CardTitle>
                <CardDescription>
                  Backend service status and environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiStatus ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 ${getHealthColor(apiStatus.health.status, apiStatus.health.ready)}`}
                      >
                        {getHealthIcon(apiStatus.health.status, apiStatus.health.ready)}
                        {apiStatus.health.status} / {apiStatus.health.ready ? 'ready' : 'not ready'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime:</span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatUptime(apiStatus.uptimeSec)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Environment:</span>
                      <Badge variant="secondary">{apiStatus.envName}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Namespace:</span>
                      <span className="text-sm text-gray-600">{apiStatus.dataNs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Process ID:</span>
                      <span className="text-sm text-gray-600">{apiStatus.pid}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <XCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                    <p className="text-red-600">API not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Build Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2 h-5 w-5" />
                  Build Information
                </CardTitle>
                <CardDescription>
                  Version and commit details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Web Version */}
                  <div className="border-b pb-3">
                    <h4 className="font-medium text-gray-900 mb-2">Web Application</h4>
                    {webVersion ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Version:</span>
                          <span className="text-sm text-gray-600">{webVersion.version}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">SHA:</span>
                          <span className="text-sm text-gray-600 font-mono">
                            {webVersion.sha || 'unknown'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Version info unavailable</p>
                    )}
                  </div>

                  {/* API Version */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">API Service</h4>
                    {apiStatus ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Version:</span>
                          <span className="text-sm text-gray-600">{apiStatus.version}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">SHA:</span>
                          <span className="text-sm text-gray-600 font-mono">
                            {apiStatus.sha || 'unknown'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Node.js:</span>
                          <span className="text-sm text-gray-600">{apiStatus.node}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">API info unavailable</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="mr-2 h-5 w-5" />
                  Feature Flags
                </CardTitle>
                <CardDescription>
                  Currently enabled/disabled features
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiStatus && Object.keys(apiStatus.flags).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(apiStatus.flags).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <Badge variant={enabled ? "default" : "secondary"}>
                          {enabled ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Flag className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600">No remote flags configured</p>
                    <p className="text-sm text-gray-500">Using environment defaults</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Counts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Content Metrics
                </CardTitle>
                <CardDescription>
                  Data counts across all modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiStatus ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(apiStatus.counts).map(([key, count]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Database className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600">Content metrics unavailable</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Raw JSON Data */}
          {apiStatus && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Raw Status Data</CardTitle>
                <CardDescription>
                  Complete API status response for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify({
                    web: webVersion,
                    api: apiStatus,
                    timestamp: new Date().toISOString()
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}