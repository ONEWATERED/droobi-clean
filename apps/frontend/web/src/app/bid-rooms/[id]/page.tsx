'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, CheckSquare, Plus, ExternalLink, Calendar } from 'lucide-react';

interface BidRoom {
  id: string;
  projectId: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  artifacts: Array<{
    id: string;
    name: string;
    url?: string;
    createdAt: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    assignee?: string;
    dueAt?: string;
    status: 'pending' | 'complete';
    createdAt: string;
  }>;
}

interface Project {
  id: string;
  title: string;
  summary: string;
  buyer: string;
  category: string;
}

export default function BidRoomDetailPage({ params }: { params: { id: string } }) {
  const [bidRoom, setBidRoom] = useState<BidRoom | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [artifactForm, setArtifactForm] = useState({ name: '', url: '' });
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', dueAt: '' });
  const [inviteForm, setInviteForm] = useState({ userId: '', email: '' });
  
  // Loading states
  const [addingArtifact, setAddingArtifact] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchBidRoom();
  }, [params.id]);

  const fetchBidRoom = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/bid-rooms/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setBidRoom(data);
      
      // Fetch project details
      if (data.projectId) {
        fetchProject(data.projectId);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bid room');
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async (projectId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/projects/${projectId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
    }
  };

  const handleAddArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artifactForm.name.trim()) {
      return;
    }

    setAddingArtifact(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/bid-rooms/${params.id}/artifacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(artifactForm)
      });

      if (response.ok) {
        setArtifactForm({ name: '', url: '' });
        fetchBidRoom(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to add artifact:', err);
    } finally {
      setAddingArtifact(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      return;
    }

    setAddingTask(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/bid-rooms/${params.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskForm)
      });

      if (response.ok) {
        setTaskForm({ title: '', assignee: '', dueAt: '' });
        fetchBidRoom(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.userId.trim() && !inviteForm.email.trim()) {
      return;
    }

    setInviting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/bid-rooms/${params.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteForm)
      });

      if (response.ok) {
        setInviteForm({ userId: '', email: '' });
        fetchBidRoom(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to invite member:', err);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading bid room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !bidRoom) {
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

  if (!bidRoom) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{bidRoom.name}</h1>
            <p className="text-xl text-gray-600">
              Collaborative workspace for project bidding
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Acting as Demo User (u1)
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team ({bidRoom.members.length})</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts ({bidRoom.artifacts.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({bidRoom.tasks.length})</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {project ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-gray-600 mt-2">{project.summary}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Buyer: {project.buyer}</span>
                        <span>Category: {project.category}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Project ID: {bidRoom.projectId}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bid Room Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Owner:</span>
                      <span className="text-sm text-gray-600">{bidRoom.ownerId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Created:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(bidRoom.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Members:</span>
                      <span className="text-sm text-gray-600">{bidRoom.members.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bidRoom.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{member}</span>
                          {member === bidRoom.ownerId && (
                            <Badge variant="secondary" className="ml-2">Owner</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invite Member</CardTitle>
                  <CardDescription>
                    Add team members to collaborate on this bid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">User ID</label>
                        <Input
                          value={inviteForm.userId}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, userId: e.target.value }))}
                          placeholder="Enter user ID"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={inviting}>
                      {inviting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Inviting...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Invite Member
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Artifacts Tab */}
            <TabsContent value="artifacts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Artifacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bidRoom.artifacts.length === 0 ? (
                      <p className="text-gray-600 text-center py-6">No artifacts yet</p>
                    ) : (
                      bidRoom.artifacts.map((artifact) => (
                        <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="mr-3 h-5 w-5 text-gray-500" />
                            <div>
                              <span className="font-medium">{artifact.name}</span>
                              <p className="text-xs text-gray-500">
                                Added {new Date(artifact.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {artifact.url && (
                            <a
                              href={artifact.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Open
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Artifact</CardTitle>
                  <CardDescription>
                    Upload documents, links, or other resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddArtifact} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name *</label>
                      <Input
                        value={artifactForm.name}
                        onChange={(e) => setArtifactForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter artifact name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">URL (optional)</label>
                      <Input
                        type="url"
                        value={artifactForm.url}
                        onChange={(e) => setArtifactForm(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="Enter URL"
                      />
                    </div>
                    <Button type="submit" disabled={addingArtifact}>
                      {addingArtifact ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Artifact
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckSquare className="mr-2 h-5 w-5" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bidRoom.tasks.length === 0 ? (
                      <p className="text-gray-600 text-center py-6">No tasks yet</p>
                    ) : (
                      bidRoom.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <CheckSquare className="mr-3 h-5 w-5 text-gray-500" />
                            <div>
                              <span className="font-medium">{task.title}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                {task.assignee && <span>Assigned to: {task.assignee}</span>}
                                {task.dueAt && (
                                  <span className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Due: {new Date(task.dueAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant={task.status === 'complete' ? 'default' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Task</CardTitle>
                  <CardDescription>
                    Create tasks to track bid preparation progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title *</label>
                      <Input
                        value={taskForm.title}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter task title"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Assignee</label>
                        <Input
                          value={taskForm.assignee}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, assignee: e.target.value }))}
                          placeholder="Assign to team member"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Due Date</label>
                        <Input
                          type="date"
                          value={taskForm.dueAt}
                          onChange={(e) => setTaskForm(prev => ({ ...prev, dueAt: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={addingTask}>
                      {addingTask ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Task
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}