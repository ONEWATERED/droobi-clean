'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 'u1'; // Using X-User-Id header default

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/community/posts/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPost(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/community/posts/${params.id}/comments`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || commenting) {
      return;
    }

    setCommenting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/community/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ text: newComment })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const comment = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !post) {
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

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/community">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Community
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Post */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-500">
                <User className="mr-1 h-4 w-4" />
                <span>by {post.authorId}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </p>
              </div>
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Comments ({comments.length})
              </CardTitle>
              <CardDescription>
                Join the discussion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Comment Form */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Acting as Demo User (u1)
                </div>
                <form onSubmit={handleAddComment} className="space-y-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    rows={3}
                    disabled={commenting}
                  />
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || commenting}
                    className="flex items-center"
                  >
                    {commenting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Add Comment
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-primary/20 pl-4 py-2">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <User className="mr-1 h-3 w-3" />
                        <span>{comment.authorId === currentUserId ? 'You (u1)' : comment.authorId}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {error && (
                <div className="mt-4 text-red-600 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}