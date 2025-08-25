import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, Calendar, ArrowLeft } from 'lucide-react';

interface WaterMinute {
  id: string;
  date: string;
  title: string;
  summary: string;
  mediaType: 'video' | 'text' | 'link';
  url?: string;
  poster?: string;
  text?: string;
  tags: string[];
  publishedAt: string;
}

async function getWaterMinute(id: string): Promise<WaterMinute | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/water-minute/${id}`, { cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch water minute:', error);
    return null;
  }
}

function renderContent(minute: WaterMinute) {
  switch (minute.mediaType) {
    case 'video':
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-full"
            poster={minute.poster}
          >
            <source src={minute.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    
    case 'text':
      return (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {minute.text}
          </p>
        </div>
      );
    
    case 'link':
      return (
        <div className="text-center py-8">
          <a
            href={minute.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Read More
          </a>
        </div>
      );
    
    default:
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">Content not available</p>
        </div>
      );
  }
}

export default async function WaterMinuteDetailPage({ params }: { params: { id: string } }) {
  const minute = await getWaterMinute(params.id);
  
  if (!minute) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/water-minute">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Water Minute
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">
                      {minute.title}
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {minute.date}
                    </Badge>
                  </div>
                  <CardDescription className="text-lg">
                    {minute.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {renderContent(minute)}
                    
                    {/* Tags */}
                    {minute.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {minute.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Published Date */}
                    <div className="text-sm text-gray-500 border-t pt-4">
                      Published {formatDate(minute.publishedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Minute Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm text-gray-600">{minute.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {minute.mediaType}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tags:</span>
                    <span className="text-sm text-gray-600">{minute.tags.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ID:</span>
                    <span className="text-sm text-gray-600">{minute.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/water-minute">
                      <Button variant="outline" className="w-full">
                        <Clock className="mr-2 h-4 w-4" />
                        Today's Minute
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}