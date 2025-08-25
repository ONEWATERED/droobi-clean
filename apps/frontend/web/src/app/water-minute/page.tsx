import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ExternalLink, Calendar } from 'lucide-react';

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

interface HistoryItem {
  id: string;
  date: string;
  title: string;
  tags: string[];
}

async function getTodayMinute(): Promise<WaterMinute | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/water-minute/today`, { cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.error ? null : data;
  } catch (error) {
    console.error('Failed to fetch today\'s water minute:', error);
    return null;
  }
}

async function getHistory(): Promise<HistoryItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/water-minute/history?limit=14`, { cache: 'no-store' });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch water minute history:', error);
    return [];
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

export default async function WaterMinutePage() {
  const todayMinute = await getTodayMinute();
  const history = await getHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatHistoryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Water Minute</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Daily 60-second insights on water technology, operations, and industry trends
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {todayMinute ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">
                        {todayMinute.title}
                      </CardTitle>
                      <Badge variant="outline" className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {todayMinute.date}
                      </Badge>
                    </div>
                    <CardDescription className="text-lg">
                      {todayMinute.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {renderContent(todayMinute)}
                      
                      {/* Tags */}
                      {todayMinute.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {todayMinute.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Published Date */}
                      <div className="text-sm text-gray-500 border-t pt-4">
                        Published {formatDate(todayMinute.publishedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Water Minute Available
                    </h3>
                    <p className="text-gray-600">
                      Check back later for today's water technology insight.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Info */}
              {todayMinute && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today's Minute</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Date:</span>
                      <span className="text-sm text-gray-600">{todayMinute.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {todayMinute.mediaType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tags:</span>
                      <span className="text-sm text-gray-600">{todayMinute.tags.length}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Water Minutes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Recent Minutes
                  </CardTitle>
                  <CardDescription>
                    Past water technology insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-gray-600 text-sm">No history available</p>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item) => (
                        <Link
                          key={item.id}
                          href={`/water-minute/${item.id}`}
                          className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatHistoryDate(item.date)}
                              </p>
                            </div>
                          </div>
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}