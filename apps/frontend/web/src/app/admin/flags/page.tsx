'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Flag, Save, CheckCircle, ArrowLeft } from 'lucide-react';

interface FeatureFlags {
  lexicon: boolean;
  directory: boolean;
  microsites: boolean;
  profiles: boolean;
  webinars: boolean;
  tv: boolean;
  trainings: boolean;
  projects: boolean;
  lounge: boolean;
  community: boolean;
  inbox: boolean;
  gamification: boolean;
  quiz: boolean;
  waterMinute: boolean;
  credentials: boolean;
}

const flagDescriptions: Record<keyof FeatureFlags, string> = {
  lexicon: 'Terminology management system',
  directory: 'Professional contact directory',
  microsites: 'Dedicated project sites',
  profiles: 'User profile management',
  webinars: 'Educational workshops and events',
  tv: 'Video content library',
  trainings: 'Structured learning courses',
  projects: 'RFP opportunities and bid rooms',
  lounge: 'Community chat rooms',
  community: 'Discussion posts and comments',
  inbox: 'Notifications and activity updates',
  gamification: 'Points, badges, and leaderboard',
  quiz: 'Daily knowledge questions',
  waterMinute: 'Daily water technology insights',
  credentials: 'License and certification management'
};

export default function AdminFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  useEffect(() => {
    if (!isAdminMode) {
      setLoading(false);
      return;
    }
    fetchFlags();
  }, [isAdminMode]);

  const fetchFlags = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/flags`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFlags(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof FeatureFlags, value: boolean) => {
    if (!flags) return;
    
    setFlags(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = async () => {
    if (!flags) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/flags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': '1'
        },
        body: JSON.stringify(flags)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedFlags = await response.json();
      setFlags(updatedFlags);
      setSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feature flags');
    } finally {
      setSaving(false);
    }
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
            <p className="text-gray-600">Loading feature flags...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <Link href="/admin" className="text-primary hover:underline mt-4 block">
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!flags) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">No feature flags data available.</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Feature Flags</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enable or disable platform modules and features
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="mr-2 h-5 w-5" />
                Module Configuration
              </CardTitle>
              <CardDescription>
                Toggle features on or off for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Feature Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(flags).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label htmlFor={key} className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          {flagDescriptions[key as keyof FeatureFlags]}
                        </p>
                      </div>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => handleToggle(key as keyof FeatureFlags, checked)}
                      />
                    </div>
                  ))}
                </div>

                {/* Save Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    
                    {saved && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Saved successfully!
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Enabled features show as active tiles on the home page</li>
                    <li>• Disabled features show "Coming soon" status</li>
                    <li>• Changes take effect immediately for all users</li>
                    <li>• Remote flags override environment variables when enabled</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}