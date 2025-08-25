'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, BarChart3, Clock, Calendar } from 'lucide-react';

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

interface HistoryItem {
  id: string;
  date: string;
  question: string;
}

export default function QuizPage() {
  const [todayQuiz, setTodayQuiz] = useState<Question | null>(null);
  const [myResponse, setMyResponse] = useState<Response | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 'u1';

  useEffect(() => {
    fetchTodayQuiz();
    fetchHistory();
  }, []);

  const fetchTodayQuiz = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/today`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      setTodayQuiz(data);
      
      // Check if user already answered
      await fetchMyResponse(data.id);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch today\'s quiz');
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

  const fetchHistory = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/history?limit=14`);
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChoice || !todayQuiz || submitted) {
      return;
    }

    setSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/quiz/${todayQuiz.id}/answer`, {
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
      await fetchStats(todayQuiz.id);
      
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

  const formatHistoryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading today's quiz...</p>
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

  if (!todayQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">No quiz available today.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Daily Quiz</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your knowledge with our daily water technology questions
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1)
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Quiz */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {formatDate(todayQuiz.date)}
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {todayQuiz.date}
                    </Badge>
                  </div>
                  <CardDescription>
                    Question of the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {todayQuiz.question}
                    </h2>

                    <form onSubmit={handleSubmit}>
                      <RadioGroup
                        value={selectedChoice}
                        onValueChange={setSelectedChoice}
                        disabled={submitted}
                        className="space-y-3"
                      >
                        {todayQuiz.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                              disabled={submitted}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                                submitted && index === todayQuiz.answerIndex
                                  ? 'bg-green-50 border-green-200'
                                  : submitted && index === parseInt(selectedChoice) && index !== todayQuiz.answerIndex
                                  ? 'bg-red-50 border-red-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {option}
                              {submitted && index === todayQuiz.answerIndex && (
                                <CheckCircle className="inline ml-2 h-4 w-4 text-green-600" />
                              )}
                              {submitted && index === parseInt(selectedChoice) && index !== todayQuiz.answerIndex && (
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
                        <p className="text-gray-700">{todayQuiz.explanation}</p>
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
                          {todayQuiz.options.map((option, index) => {
                            const count = stats.counts[index] || 0;
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            const isCorrect = index === todayQuiz.answerIndex;
                            
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
              {/* Quiz Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm text-gray-600">{todayQuiz.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Options:</span>
                    <span className="text-sm text-gray-600">{todayQuiz.options.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={submitted ? "default" : "secondary"}>
                      {submitted ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Recent Quizzes
                  </CardTitle>
                  <CardDescription>
                    Past questions you can review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-gray-600 text-sm">No quiz history available</p>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((item) => (
                        <Link
                          key={item.id}
                          href={`/quiz/${item.id}`}
                          className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.question}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatHistoryDate(item.date)}
                              </p>
                            </div>
                          </div>
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