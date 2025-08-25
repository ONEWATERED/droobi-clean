'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Users, Video, CheckCircle, Loader2 } from 'lucide-react';

interface Webinar {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  host: string;
  platform: string;
  description: string;
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchWebinar();
  }, [params.id]);

  const fetchWebinar = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/webinars/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWebinar(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch webinar');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/webinars/${params.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      setRegistered(true);
      setFormData({ name: '', email: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'zoom':
        return <Video className="h-4 w-4" />;
      case 'meet':
        return <Users className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'zoom':
        return 'bg-blue-100 text-blue-800';
      case 'meet':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !webinar) {
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

  if (!webinar) {
    notFound();
  }

  const dateTime = formatDateTime(webinar.startsAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Badge 
                variant="secondary" 
                className={`flex items-center gap-2 text-sm ${getPlatformColor(webinar.platform)}`}
              >
                {getPlatformIcon(webinar.platform)}
                {webinar.platform.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{webinar.title}</h1>
            <p className="text-xl text-gray-600">
              Hosted by {webinar.host}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{dateTime.date}</p>
                      <p className="text-sm text-gray-600">{dateTime.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-3 h-5 w-5 text-gray-500" />
                    <p>{webinar.durationMin} minutes</p>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-gray-500" />
                    <p>Hosted by {webinar.host}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {webinar.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Registration Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Register for Event</CardTitle>
                  <CardDescription>
                    Secure your spot for this webinar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registered ? (
                    <div className="text-center py-6">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        You're in!
                      </h3>
                      <p className="text-sm text-green-600">
                        Check your email for event details and joining instructions.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      
                      {error && (
                        <div className="text-red-600 text-sm">
                          {error}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registering}
                      >
                        {registering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Register Now'
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Event Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPlatformColor(webinar.platform)}`}
                    >
                      {webinar.platform.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm text-gray-600">{webinar.durationMin} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Host:</span>
                    <span className="text-sm text-gray-600">{webinar.host}</span>
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