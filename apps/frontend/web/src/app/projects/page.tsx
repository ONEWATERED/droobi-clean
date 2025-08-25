'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Building2, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  source: string;
  status: string;
  publishedAt: string;
  dueAt: string;
  buyer: string;
  category: string;
  region: string;
  summary: string;
  url: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const [savingProject, setSavingProject] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    q: '',
    source: '',
    status: '',
    category: '',
    region: '',
    dueBefore: ''
  });
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      const url = `${baseUrl}/projects${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedProjects = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/me/saved-projects`, {
        headers: {
          'X-User-Id': 'u1'
        }
      });
      
      if (response.ok) {
        const saved = await response.json();
        setSavedProjects(new Set(saved.map((s: any) => s.projectId)));
      }
    } catch (err) {
      console.error('Failed to fetch saved projects:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchSavedProjects();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProjects();
  };

  const handleSaveProject = async (projectId: string) => {
    setSavingProject(projectId);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/projects/${projectId}/save`, {
        method: 'POST',
        headers: {
          'X-User-Id': 'u1'
        }
      });
      
      if (response.ok) {
        setSavedProjects(prev => new Set([...prev, projectId]));
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setSavingProject(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'No due date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'sam.gov':
        return 'bg-purple-100 text-purple-800';
      case 'state portal':
        return 'bg-orange-100 text-orange-800';
      case 'county portal':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading projects...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RFP & Project Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and track water infrastructure projects and procurement opportunities
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1)
          </div>
        </div>

        {/* Filter Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search projects..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Source</label>
                <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sources</SelectItem>
                    <SelectItem value="SAM.gov">SAM.gov</SelectItem>
                    <SelectItem value="State Portal">State Portal</SelectItem>
                    <SelectItem value="County Portal">County Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="Wastewater">Wastewater</SelectItem>
                    <SelectItem value="Drinking Water">Drinking Water</SelectItem>
                    <SelectItem value="Stormwater">Stormwater</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Due Before</label>
                <Input
                  type="date"
                  value={filters.dueBefore}
                  onChange={(e) => handleFilterChange('dueBefore', e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({ q: '', source: '', status: '', category: '', region: '', dueBefore: '' });
                  setLoading(true);
                  setTimeout(() => fetchProjects(), 100);
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const isSaved = savedProjects.has(project.id);
              const isSaving = savingProject === project.id;
              
              return (
                <Card key={project.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">
                        {project.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveProject(project.id)}
                        disabled={isSaving}
                        className="ml-2 flex-shrink-0"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className={getSourceColor(project.source)}>
                        {project.source}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="mr-2 h-4 w-4" />
                        {project.buyer}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        Due: {formatDate(project.dueAt)}
                      </div>

                      <CardDescription className="line-clamp-3">
                        {project.summary}
                      </CardDescription>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{project.category} • {project.region}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          Open
                        </Link>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Source
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}