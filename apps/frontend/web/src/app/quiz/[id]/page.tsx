'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, BarChart3, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  date: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface Response {
  quizId: string;
  userId: string;
  choiceIndex: number;
  correct: boolean;
  at: number;
}

interface Stats {
  counts: number[];
  total: number;
  correctRate: number;
}

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  const [quiz, setQuiz] = useState<Question | null>(null);
  const [myResponse, setMyResponse] = useState<Response | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 'u1';

  useEffect(() => {
    fetchQuiz();
  }, [params.id]);

  const fetchQuiz = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setQuiz(data);
      
      // Check if user already answered
      await fetchMyResponse(params.id);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyResponse = async (quizId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/${quizId}/my-response`, {
        headers: {
          'X-User-Id': currentUserId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyResponse(data);
        setSelectedChoice(data.choiceIndex.toString());
        setSubmitted(true);
        
        // Fetch stats if already answered
        await fetchStats(quizId);
      }
    } catch (err) {
      // Ignore errors - user hasn't answered yet
    }
  };

  const fetchStats = async (quizId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/${quizId}/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChoice || !quiz || submitted) {
      return;
    }

    setSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/${quiz.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify({ choiceIndex: parseInt(selectedChoice) })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setMyResponse(result.response);
      setSubmitted(true);
      
      // Fetch updated stats
      await fetchStats(quiz.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
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

  if (!quiz) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/quiz">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quiz
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Details</h1>
            <p className="text-gray-600">{formatDate(quiz.date)}</p>
            <div className="mt-4 text-sm text-gray-500">
              Acting as Demo User (u1)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Quiz */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {quiz.question}
                  </CardTitle>
                  <CardDescription>
                    Select the best answer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit}>
                      <RadioGroup
                        value={selectedChoice}
                        onValueChange={setSelectedChoice}
                        disabled={submitted}
                        className="space-y-3"
                      >
                        {quiz.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                              disabled={submitted}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                                submitted && index === quiz.answerIndex
                                  ? 'bg-green-50 border-green-200'
                                  : submitted && index === parseInt(selectedChoice) && index !== quiz.answerIndex
                                  ? 'bg-red-50 border-red-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {option}
                              {submitted && index === quiz.answerIndex && (
                                <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                              )}
                              {submitted && index === parseInt(selectedChoice) && index !== quiz.answerIndex && (
                                <XCircle className="inline ml-2 h-4 w-4 text-red-600" />
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {!submitted && (
                        <div className="mt-6">
                          <Button
                            type="submit"
                            disabled={!selectedChoice || submitting}
                            className="w-full"
                          >
                            {submitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Submitting...
                              </>
                            ) : (
                              'Submit Answer'
                            )}
                          </Button>
                        </div>
                      )}
                    </form>

                    {/* Result */}
                    {submitted && myResponse && (
                      <div className="mt-6 p-4 rounded-lg border">
                        <div className="flex items-center mb-3">
                          {myResponse.correct ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <span className="font-semibold text-green-800">Correct!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-600 mr-2" />
                              <span className="font-semibold text-red-800">Not quite</span>
                            </>
                          )}
                        </div>
                        <p className="text-gray-700">{quiz.explanation}</p>
                      </div>
                    )}

                    {/* Stats */}
                    {submitted && stats && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Community Results
                        </h3>
                        <div className="space-y-2">
                          {quiz.options.map((option, index) => {
                            const count = stats.counts[index] || 0;
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            const isCorrect = index === quiz.answerIndex;
                            
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <span className={`text-sm ${isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                                  {option}
                                  {isCorrect && <CheckCircle className="inline ml-1 h-3 w-3 text-green-600" />}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-blue-500'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 w-8">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Total responses: {stats.total}</span>
                            <span>Correct rate: {(stats.correctRate * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quiz Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quiz ID:</span>
                    <span className="text-sm text-gray-600">{quiz.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm text-gray-600">{quiz.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Options:</span>
                    <span className="text-sm text-gray-600">{quiz.options.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={submitted ? "default" : "secondary"}>
                      {submitted ? "Completed" : "Pending"}
                    </Badge>
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
                    <Link href="/quiz">
                      <Button variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" />
                        Today's Quiz
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