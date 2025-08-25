'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, Calendar, CheckCircle, Circle, Loader2, User } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  durationMin: number;
}

interface Training {
  id: string;
  title: string;
  level: string;
  durationMin: number;
  tags: string[];
  publishedAt: string;
  description: string;
  lessons: Lesson[];
}

interface Progress {
  id: string;
  userId: string;
  trainingId: string;
  lessonId: string;
  status: 'complete' | 'incomplete';
  updatedAt: string;
}

export default function TrainingDetailPage({ params }: { params: { id: string } }) {
  const [training, setTraining] = useState<Training | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchTraining();
    fetchProgress();
  }, [params.id]);

  const fetchTraining = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/trainings/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTraining(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch training');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/trainings/${params.id}/progress`, {
        headers: {
          'X-User-Id': 'u1'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setEnrolling(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/trainings/${params.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'u1'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      setEnrolled(true);
      setFormData({ name: '', email: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleProgressUpdate = async (lessonId: string, status: 'complete' | 'incomplete') => {
    setUpdatingProgress(lessonId);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/trainings/${params.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'u1'
        },
        body: JSON.stringify({ lessonId, status })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Refresh progress
      await fetchProgress();
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setUpdatingProgress(null);
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
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
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

  const isLessonComplete = (lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.status === 'complete');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading training details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !training) {
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

  if (!training) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Badge 
                variant="secondary" 
                className={`text-sm ${getLevelColor(training.level)}`}
              >
                {training.level.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{training.title}</h1>
            <p className="text-xl text-gray-600">
              {formatDuration(training.durationMin)} • {training.lessons.length} lessons
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Details */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {training.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Published {formatDate(training.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {formatDuration(training.durationMin)}
                    </div>
                  </div>
                  {training.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {training.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Lessons</CardTitle>
                  <CardDescription>
                    Track your progress through each lesson
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {training.lessons.map((lesson, index) => {
                      const isComplete = isLessonComplete(lesson.id);
                      const isUpdating = updatingProgress === lesson.id;
                      
                      return (
                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500 w-8">
                              {index + 1}.
                            </span>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-gray-600">
                                {formatDuration(lesson.durationMin)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={isComplete ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleProgressUpdate(
                              lesson.id, 
                              isComplete ? 'incomplete' : 'complete'
                            )}
                            disabled={isUpdating}
                            className="flex items-center"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isComplete ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete
                              </>
                            ) : (
                              <>
                                <Circle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Enrollment */}
              <Card>
                <CardHeader>
                  <CardTitle>Enroll in Course</CardTitle>
                  <CardDescription>
                    Get access to all course materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {enrolled ? (
                    <div className="text-center py-6">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Enrolled!
                      </h3>
                      <p className="text-sm text-green-600">
                        You now have access to all course materials and can track your progress.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnroll} className="space-y-4">
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
                        disabled={enrolling}
                      >
                        {enrolling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <User className="mr-2 h-4 w-4" />
                            Enroll Now
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level:</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getLevelColor(training.level)}`}
                    >
                      {training.level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm text-gray-600">{formatDuration(training.durationMin)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lessons:</span>
                    <span className="text-sm text-gray-600">{training.lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress:</span>
                    <span className="text-sm text-gray-600">
                      {progress.filter(p => p.status === 'complete').length} / {training.lessons.length}
                    </span>
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