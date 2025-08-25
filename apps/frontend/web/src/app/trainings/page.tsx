'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Clock, Calendar } from 'lucide-react';

interface Training {
  id: string;
  title: string;
  level: string;
  durationMin: number;
  tags: string[];
  publishedAt: string;
  description: string;
  lessons: Array<{
    id: string;
    title: string;
    durationMin: number;
  }>;
}

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchTrainings = async (q?: string, level?: string, tag?: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (level) params.set('level', level);
      if (tag) params.set('tag', tag);
      
      const url = `${baseUrl}/trainings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTrainings(data);
      
      // Extract unique tags
      const tags = new Set<string>();
      data.forEach((training: Training) => {
        training.tags.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleSearch = () => {
    setLoading(true);
    fetchTrainings(searchQuery, selectedLevel, selectedTag);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setLoading(true);
    fetchTrainings(searchQuery, level, selectedTag);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setLoading(true);
    fetchTrainings(searchQuery, selectedLevel, tag);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading trainings...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Training Courses</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Structured learning paths for water technology and AI implementation
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search trainings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <Select value={selectedLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Trainings Grid */}
        {trainings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No trainings found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training) => (
              <Card key={training.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">
                      {training.title}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 text-xs ${getLevelColor(training.level)}`}
                    >
                      {training.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <CardDescription>
                      {training.description}
                    </CardDescription>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatDuration(training.durationMin)} • {training.lessons.length} lessons
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Published {formatDate(training.publishedAt)}
                    </div>

                    {training.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {training.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {training.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{training.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-3">
                      <Link
                        href={`/trainings/${training.id}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Course
                      </Link>
                    </div>
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