'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

export default function NewVideoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    poster: '',
    tags: '',
    durationSec: 0
  });

  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  // Redirect if not in admin mode
  if (!isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-600">Access denied. Admin mode required.</p>
            <Link href="/tv" className="text-primary hover:underline">
              Back to TV
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.url.trim()) {
      setError('Title, description, and URL are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const payload = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        poster: formData.poster || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        publishedAt: new Date().toISOString(),
        durationSec: formData.durationSec || 0
      };

      const response = await fetch(`${baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': '1'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const video = await response.json();
      router.push(`/tv/${video.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create video');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/tv">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to TV
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Add New Video</h1>
            <p className="text-gray-600">
              Create a new video entry for Droobi TV
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Video Information
              </CardTitle>
              <CardDescription>
                Fill in the details for the new video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter video title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter video description"
                    rows={4}
                    required
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Video URL *
                  </label>
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports MP4 files, YouTube, and Vimeo URLs
                  </p>
                </div>

                {/* Poster */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Poster Image URL
                  </label>
                  <Input
                    type="url"
                    value={formData.poster}
                    onChange={(e) => handleInputChange('poster', e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.durationSec}
                    onChange={(e) => handleInputChange('durationSec', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  {formData.durationSec > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {formatDuration(formData.durationSec)}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tags
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="intro, demo, ai, platform"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                  {formData.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Link href="/tv">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Video
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}