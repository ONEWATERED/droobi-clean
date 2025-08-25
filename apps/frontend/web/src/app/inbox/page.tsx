'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Check, Inbox as InboxIcon } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  createdAt: number;
  readAt: number | null;
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 'u1'; // Using X-User-Id header default

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/inbox`, {
        headers: {
          'X-User-Id': currentUserId
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    setMarkingRead(notificationId);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/inbox/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'X-User-Id': currentUserId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update the notification in the local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, readAt: Date.now() }
            : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    } finally {
      setMarkingRead(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'webinar.registered':
        return 'bg-blue-100 text-blue-800';
      case 'projects.saved':
        return 'bg-green-100 text-green-800';
      case 'training.enrolled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => n.readAt === null).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading notifications...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Inbox</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with your notifications and activity
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1)
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header Stats */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {notifications.length === 0 
                  ? "You're all caught up." 
                  : `${notifications.length} total notifications`
                }
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <InboxIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  You're all caught up!
                </h3>
                <p className="text-gray-600">
                  No notifications to show right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const isUnread = notification.readAt === null;
                const isMarking = markingRead === notification.id;
                
                return (
                  <Card key={notification.id} className={`group hover:shadow-lg transition-all duration-200 ${isUnread ? 'border-l-4 border-l-primary' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">
                              {notification.title}
                            </CardTitle>
                            {isUnread && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <Badge variant="outline" className={`text-xs ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {notification.body}
                          </CardDescription>
                          <div className="text-sm text-gray-500 mt-2">
                            {formatDate(notification.createdAt)}
                            {notification.readAt && (
                              <span className="ml-2">• Read {formatDate(notification.readAt)}</span>
                            )}
                          </div>
                        </div>
                        
                        {isUnread && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkRead(notification.id)}
                            disabled={isMarking}
                            className="ml-4 flex items-center"
                          >
                            {isMarking ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                              <>
                                <Check className="mr-2 h-3 w-3" />
                                Mark Read
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}