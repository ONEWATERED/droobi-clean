'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Play, Clock, Plus } from 'lucide-react';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  poster?: string;
  tags: string[];
  publishedAt: string;
  durationSec: number;
}

export default function TVPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';

  const fetchVideos = async (q?: string, tag?: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (tag) params.set('tag', tag);
      
      const url = `${baseUrl}/videos${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVideos(data);
      
      // Extract unique tags
      const tags = new Set<string>();
      data.forEach((video: Video) => {
        video.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    fetchVideos(searchQuery, selectedTag);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setLoading(true);
    fetchVideos(searchQuery, tag);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading videos...</p>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Droobi TV</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch educational content, demos, and highlights from our platform
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search & Filter
              </CardTitle>
              {isAdminMode && (
                <Link href="/tv/new">
                  <Button className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Video
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tag</label>
                <Select value={selectedTag} onValueChange={handleTagChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No videos found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="p-0">
                  <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    {video.poster ? (
                      <Image
                        src={video.poster}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Play className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatDuration(video.durationSec)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {video.title}
                  </CardTitle>
                  <CardDescription className="mb-3 line-clamp-2">
                    {video.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(video.publishedAt)}
                    </span>
                    <Link
                      href={`/tv/${video.id}`}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Watch
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}