'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Star, Medal, Sparkles, Compass, Award, Plus } from 'lucide-react';

interface UserPoints {
  points: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: {
    type: string;
    threshold: number;
  };
}

interface LeaderboardEntry {
  userId: string;
  points: number;
}

export default function GamificationPage() {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Admin form state
  const [adminForm, setAdminForm] = useState({
    userId: 'u1',
    amount: 0,
    reason: ''
  });
  const [awarding, setAwarding] = useState(false);

  const isAdminMode = process.env.NEXT_PUBLIC_ADMIN_MODE === '1';
  const currentUserId = 'u1';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch user points
      const pointsResponse = await fetch(`${baseUrl}/me/points`, {
        headers: { 'X-User-Id': currentUserId }
      });
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setUserPoints(pointsData);
      }
      
      // Fetch user badges
      const badgesResponse = await fetch(`${baseUrl}/me/badges`, {
        headers: { 'X-User-Id': currentUserId }
      });
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }
      
      // Fetch leaderboard
      const leaderboardResponse = await fetch(`${baseUrl}/leaderboard?limit=10`);
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gamification data');
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminForm.userId || adminForm.amount === 0) {
      return;
    }

    setAwarding(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin': '1'
        },
        body: JSON.stringify(adminForm)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh data
      await fetchData();
      setAdminForm({ userId: 'u1', amount: 0, reason: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award points');
    } finally {
      setAwarding(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="h-8 w-8" />;
      case 'Medal':
        return <Medal className="h-8 w-8" />;
      case 'Compass':
        return <Compass className="h-8 w-8" />;
      case 'Award':
        return <Award className="h-8 w-8" />;
      default:
        return <Star className="h-8 w-8" />;
    }
  };

  const getUserRank = (userId: string): number => {
    const index = leaderboard.findIndex(entry => entry.userId === userId);
    return index >= 0 ? index + 1 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading gamification data...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gamification</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your progress, earn badges, and compete on the leaderboard
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1)
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Your Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                    Your Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                      {userPoints?.points || 0}
                    </div>
                    <p className="text-gray-600">Total Points Earned</p>
                    {getUserRank(currentUserId) > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Rank #{getUserRank(currentUserId)} on leaderboard
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Your Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-6 w-6 text-purple-500" />
                    Your Badges ({badges.length})
                  </CardTitle>
                  <CardDescription>
                    Achievements you've unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {badges.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">No badges earned yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete activities to earn your first badge!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="flex items-center p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                          <div className="text-yellow-600 mr-4">
                            {getIconComponent(badge.icon)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                            <p className="text-sm text-gray-600">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Panel */}
              {isAdminMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="mr-2 h-5 w-5" />
                      Admin: Award Points
                    </CardTitle>
                    <CardDescription>
                      Manually award points to users (admin only)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAwardPoints} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">User ID</label>
                          <Input
                            value={adminForm.userId}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, userId: e.target.value }))}
                            placeholder="Enter user ID"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Points</label>
                          <Input
                            type="number"
                            value={adminForm.amount}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                            placeholder="Enter points amount"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
                        <Textarea
                          value={adminForm.reason}
                          onChange={(e) => setAdminForm(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="Reason for awarding points"
                          rows={2}
                        />
                      </div>
                      <Button type="submit" disabled={awarding || adminForm.amount === 0}>
                        {awarding ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Awarding...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Award Points
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Top 10 users by points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600">No users on leaderboard yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => {
                        const isCurrentUser = entry.userId === currentUserId;
                        const rank = index + 1;
                        
                        return (
                          <div 
                            key={entry.userId} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                                rank === 2 ? 'bg-gray-100 text-gray-600' :
                                rank === 3 ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {rank <= 3 ? (
                                  <Trophy className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-bold">{rank}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {isCurrentUser ? 'You (u1)' : entry.userId}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {entry.points} points
                                </p>
                              </div>
                            </div>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Point Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Register for webinar</span>
                    <Badge variant="outline" className="text-xs">+10</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Create community post</span>
                    <Badge variant="outline" className="text-xs">+8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Save project</span>
                    <Badge variant="outline" className="text-xs">+5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Post comment</span>
                    <Badge variant="outline" className="text-xs">+3</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Badge Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Badge Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm">Early Adopter</span>
                    </div>
                    <span className="text-xs text-gray-600">5 actions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Medal className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm">Contributor</span>
                    </div>
                    <span className="text-xs text-gray-600">3 comments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Compass className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">Explorer</span>
                    </div>
                    <span className="text-xs text-gray-600">5 modules</span>
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