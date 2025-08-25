'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, CheckCircle, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface AppSettings {
  brandName: string;
  brandTagline: string;
  logoUrl: string;
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
  social: {
    x: string;
    linkedin: string;
    youtube: string;
  };
  footerLinks: Array<{
    label: string;
    href: string;
  }>;
  aboutHtml: string;
}

export default function AdminAppSettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
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
    fetchSettings();
  }, [isAdminMode]);

  const fetchSettings = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/app-settings`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch app settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/admin/app-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': '1'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save app settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!settings) return;
    
    if (field.startsWith('social.')) {
      const socialField = field.split('.')[1];
      setSettings(prev => prev ? {
        ...prev,
        social: { ...prev.social, [socialField]: value }
      } : null);
    } else {
      setSettings(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleFooterLinkChange = (index: number, field: 'label' | 'href', value: string) => {
    if (!settings) return;
    
    const newFooterLinks = [...settings.footerLinks];
    newFooterLinks[index] = { ...newFooterLinks[index], [field]: value };
    setSettings(prev => prev ? { ...prev, footerLinks: newFooterLinks } : null);
  };

  const addFooterLink = () => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      footerLinks: [...prev.footerLinks, { label: '', href: '' }]
    } : null);
  };

  const removeFooterLink = (index: number) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      footerLinks: prev.footerLinks.filter((_, i) => i !== index)
    } : null);
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
            <p className="text-gray-600">Loading app settings...</p>
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

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">No app settings data available.</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">App Settings</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configure branding, contact information, and site-wide settings
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Brand Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Brand Settings
              </CardTitle>
              <CardDescription>
                Configure your platform's branding and identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Brand Name</label>
                  <Input
                    value={settings.brandName}
                    onChange={(e) => handleInputChange('brandName', e.target.value)}
                    placeholder="Your brand name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Brand Tagline</label>
                  <Input
                    value={settings.brandTagline}
                    onChange={(e) => handleInputChange('brandTagline', e.target.value)}
                    placeholder="Your brand tagline"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Logo URL</label>
                <Input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Support and legal contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Support Email</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Privacy Policy URL</label>
                  <Input
                    type="url"
                    value={settings.privacyUrl}
                    onChange={(e) => handleInputChange('privacyUrl', e.target.value)}
                    placeholder="https://example.com/privacy"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Terms of Service URL</label>
                  <Input
                    type="url"
                    value={settings.termsUrl}
                    onChange={(e) => handleInputChange('termsUrl', e.target.value)}
                    placeholder="https://example.com/terms"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Links to your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">X (Twitter)</label>
                <Input
                  type="url"
                  value={settings.social.x}
                  onChange={(e) => handleInputChange('social.x', e.target.value)}
                  placeholder="https://x.com/yourhandle"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">LinkedIn</label>
                <Input
                  type="url"
                  value={settings.social.linkedin}
                  onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">YouTube</label>
                <Input
                  type="url"
                  value={settings.social.youtube}
                  onChange={(e) => handleInputChange('social.youtube', e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Links</CardTitle>
              <CardDescription>
                Configure navigation links in the site footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.footerLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={link.label}
                    onChange={(e) => handleFooterLinkChange(index, 'label', e.target.value)}
                    placeholder="Link label"
                    className="flex-1"
                  />
                  <Input
                    value={link.href}
                    onChange={(e) => handleFooterLinkChange(index, 'href', e.target.value)}
                    placeholder="Link URL"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFooterLink(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addFooterLink}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Footer Link
              </Button>
            </CardContent>
          </Card>

          {/* About Content */}
          <Card>
            <CardHeader>
              <CardTitle>About Content</CardTitle>
              <CardDescription>
                HTML content for the about page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">About HTML</label>
                <Textarea
                  value={settings.aboutHtml}
                  onChange={(e) => handleInputChange('aboutHtml', e.target.value)}
                  placeholder="<p>Your about content...</p>"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Basic HTML tags are supported (p, strong, em, a, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
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
                        Save Settings
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}