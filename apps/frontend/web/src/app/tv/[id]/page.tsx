import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

async function getVideo(id: string): Promise<Video | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/videos/${id}`, { cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch video:', error);
    return null;
  }
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const video = await getVideo(params.id);
  
  if (!video) {
    notFound();
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderPlayer = () => {
    if (isYouTubeUrl(video.url)) {
      return (
        <iframe
          src={getYouTubeEmbedUrl(video.url)}
          className="w-full aspect-video rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    if (isVimeoUrl(video.url)) {
      return (
        <iframe
          src={getVimeoEmbedUrl(video.url)}
          className="w-full aspect-video rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    // Default to HTML5 video for MP4 and other formats
    return (
      <video
        controls
        className="w-full aspect-video rounded-lg bg-black"
        poster={video.poster}
      >
        <source src={video.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
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

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Video Player */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {renderPlayer()}
                </CardContent>
              </Card>
              
              {/* Video Info */}
              <div className="mt-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {video.title}
                </h1>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {video.description}
                </p>
                
                {/* Tags */}
                {video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Video Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(video.durationSec)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Published</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(video.publishedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">More Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/tv">
                      <Button variant="outline" className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Browse All Videos
                      </Button>
                    </Link>
                    <Link href="/events">
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Upcoming Events
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Video Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Video ID:</span>
                    <span className="text-sm text-gray-600">{video.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Format:</span>
                    <span className="text-sm text-gray-600">
                      {isYouTubeUrl(video.url) ? 'YouTube' : 
                       isVimeoUrl(video.url) ? 'Vimeo' : 'MP4'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tags:</span>
                    <span className="text-sm text-gray-600">{video.tags.length}</span>
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