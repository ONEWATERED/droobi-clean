import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, ExternalLink, FileText, Bookmark, Plus } from 'lucide-react';
import Link from 'next/link';

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

async function getProject(id: string): Promise<Project | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/projects/${id}`, { cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  
  if (!project) {
    notFound();
  }

  const formatDate = (isoString: string) => {
    if (!isoString) return 'No due date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4 gap-2">
              <Badge 
                variant="secondary" 
                className={`text-sm ${getSourceColor(project.source)}`}
              >
                {project.source}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-sm ${getStatusColor(project.status)}`}
              >
                {project.status}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
            <p className="text-xl text-gray-600">
              {project.buyer} • {project.category}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Acting as Demo User (u1)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {project.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Attachments */}
              {project.attachments && project.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="mr-3 h-5 w-5 text-gray-500" />
                            <span className="font-medium">{attachment.name}</span>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Building2 className="mr-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Buyer</p>
                      <p className="text-sm text-gray-600">{project.buyer}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className="text-sm text-gray-600">{formatDate(project.dueAt)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Category:</span>
                      <span className="text-sm text-gray-600">{project.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Region:</span>
                      <span className="text-sm text-gray-600">{project.region}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Published:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(project.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save Project
                  </Button>
                  
                  <Link href={`/bid-rooms/new?projectId=${project.id}`}>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Bid Room
                    </Button>
                  </Link>
                  
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}