'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Save, CheckCircle, ArrowLeft, Printer, User, Building, Mail, Phone, Globe, MapPin } from 'lucide-react';
import Link from 'next/link';

interface BusinessCard {
  userId: string;
  name?: string;
  title?: string;
  org?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  updatedAt: number;
}

export default function BusinessCardPage() {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    org: '',
    email: '',
    phone: '',
    website: '',
    location: ''
  });

  const currentUserId = 'u1';

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/me/card`, {
        headers: {
          'X-User-Id': currentUserId
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCard(data);
      setFormData({
        name: data.name || '',
        title: data.title || '',
        org: data.org || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        location: data.location || ''
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch business card');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/me/card`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const updatedCard = await response.json();
      setCard(updatedCard);
      setSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save business card');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatLastUpdated = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading business card...</p>
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
          <Link href="/credentials">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Credentials
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Business Card</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and customize your digital business card
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1) • Last updated: {formatLastUpdated(card?.updatedAt || 0)}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Card Information
                </CardTitle>
                <CardDescription>
                  Fill in your professional contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Organization</label>
                  <Input
                    value={formData.org}
                    onChange={(e) => handleInputChange('org', e.target.value)}
                    placeholder="Your company or organization"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website</label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
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
                          Save Card
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

                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See how your business card will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Business Card Preview */}
                  <div className="business-card bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          {formData.name || 'Your Name'}
                        </h2>
                        <p className="text-gray-600">
                          {formData.title || 'Your Title'}
                        </p>
                        {formData.org && (
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Building className="mr-1 h-3 w-3" />
                            {formData.org}
                          </p>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        {formData.email && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Mail className="mr-2 h-4 w-4 text-gray-500" />
                            {formData.email}
                          </div>
                        )}
                        {formData.phone && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Phone className="mr-2 h-4 w-4 text-gray-500" />
                            {formData.phone}
                          </div>
                        )}
                        {formData.website && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Globe className="mr-2 h-4 w-4 text-gray-500" />
                            {formData.website}
                          </div>
                        )}
                        {formData.location && (
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                            {formData.location}
                          </div>
                        )}
                      </div>

                      {/* Empty State */}
                      {!formData.name && !formData.title && !formData.org && !formData.email && (
                        <div className="text-center py-8 text-gray-400">
                          <User className="mx-auto h-8 w-8 mb-2" />
                          <p className="text-sm">Fill in the form to see your card preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .business-card, .business-card * {
              visibility: visible;
            }
            .business-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 3.5in;
              height: 2in;
              border: 1px solid #000;
              padding: 0.25in;
              background: white;
              box-shadow: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
}