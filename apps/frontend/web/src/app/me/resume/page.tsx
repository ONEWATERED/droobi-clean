'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Save, ExternalLink, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Resume {
  userId: string;
  url?: string;
  text?: string;
  updatedAt: number;
}

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    text: ''
  });

  const currentUserId = 'u1';

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/me/resume`, {
        headers: {
          'X-User-Id': currentUserId
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResume(data);
      setFormData({
        url: data.url || '',
        text: data.text || ''
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resume');
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
      const response = await fetch(`${baseUrl}/me/resume`, {
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

      const updatedResume = await response.json();
      setResume(updatedResume);
      setSaved(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save resume');
    } finally {
      setSaving(false);
    }
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
            <p className="text-gray-600">Loading resume...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Management</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume or create one using our text editor
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1)
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Resume Information
              </CardTitle>
              <CardDescription>
                Last updated: {formatLastUpdated(resume?.updatedAt || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="url" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Resume URL</TabsTrigger>
                  <TabsTrigger value="text">Text Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Resume URL
                    </label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="https://example.com/my-resume.pdf"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Link to your resume hosted elsewhere (PDF, Google Docs, etc.)
                    </p>
                  </div>
                  
                  {formData.url && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Preview</h3>
                      <a
                        href={formData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Resume
                      </a>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Resume Text
                    </label>
                    <Textarea
                      value={formData.text}
                      onChange={(e) => handleInputChange('text', e.target.value)}
                      placeholder="Paste your resume content here..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Plain text version of your resume
                    </p>
                  </div>
                  
                  {formData.text && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Preview</h3>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {formData.text.substring(0, 500)}
                        {formData.text.length > 500 && '...'}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

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
                        Save Resume
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