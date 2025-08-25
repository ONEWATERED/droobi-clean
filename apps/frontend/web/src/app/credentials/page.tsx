'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Award, AlertTriangle, CheckCircle } from 'lucide-react';

interface Credential {
  id: string;
  userId: string;
  name: string;
  issuer?: string;
  licenseNo?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  status?: 'active' | 'expiringSoon' | 'expired';
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    licenseNo: '',
    issuedAt: '',
    expiresAt: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = 'u1';

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/credentials`, {
        headers: {
          'X-User-Id': currentUserId
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCredentials(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const newCredential = await response.json();
      setCredentials(prev => [...prev, newCredential].sort((a, b) => {
        if (!a.expiresAt && !b.expiresAt) return a.name.localeCompare(b.name);
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return a.expiresAt.localeCompare(b.expiresAt);
      }));
      
      setFormData({ name: '', issuer: '', licenseNo: '', issuedAt: '', expiresAt: '', notes: '' });
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCredential || !formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/credentials/${editingCredential.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUserId
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const updatedCredential = await response.json();
      setCredentials(prev => prev.map(c => 
        c.id === editingCredential.id ? updatedCredential : c
      ).sort((a, b) => {
        if (!a.expiresAt && !b.expiresAt) return a.name.localeCompare(b.name);
        if (!a.expiresAt) return 1;
        if (!b.expiresAt) return -1;
        return a.expiresAt.localeCompare(b.expiresAt);
      }));
      
      setEditingCredential(null);
      setFormData({ name: '', issuer: '', licenseNo: '', issuedAt: '', expiresAt: '', notes: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': currentUserId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credential');
    }
  };

  const openAddDialog = () => {
    setFormData({ name: '', issuer: '', licenseNo: '', issuedAt: '', expiresAt: '', notes: '' });
    setEditingCredential(null);
    setIsAddDialogOpen(true);
    setError(null);
  };

  const openEditDialog = (credential: Credential) => {
    setFormData({
      name: credential.name,
      issuer: credential.issuer || '',
      licenseNo: credential.licenseNo || '',
      issuedAt: credential.issuedAt || '',
      expiresAt: credential.expiresAt || '',
      notes: credential.notes || ''
    });
    setEditingCredential(credential);
    setIsAddDialogOpen(true);
    setError(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiringSoon':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'expired':
        return <AlertTriangle className="h-3 w-3" />;
      case 'expiringSoon':
        return <AlertTriangle className="h-3 w-3" />;
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-gray-600">Loading credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Credentials</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your professional licenses, certifications, and qualifications
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Acting as Demo User (u1)
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900">Your Credentials</h2>
              <Badge variant="outline">
                {credentials.length} total
              </Badge>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCredential ? 'Edit Credential' : 'Add New Credential'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCredential ? 'Update your credential information' : 'Add a new professional credential'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingCredential ? handleEdit : handleAdd} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., PE – Civil"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Issuer</label>
                    <Input
                      value={formData.issuer}
                      onChange={(e) => handleInputChange('issuer', e.target.value)}
                      placeholder="e.g., State Board"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">License Number</label>
                    <Input
                      value={formData.licenseNo}
                      onChange={(e) => handleInputChange('licenseNo', e.target.value)}
                      placeholder="e.g., PE-123456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Issued Date</label>
                      <Input
                        type="date"
                        value={formData.issuedAt}
                        onChange={(e) => handleInputChange('issuedAt', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expires Date</label>
                      <Input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional notes or reminders"
                      rows={3}
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingCredential ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingCredential ? 'Update' : 'Add'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Credentials Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Professional Credentials
              </CardTitle>
              <CardDescription>
                Track your licenses, certifications, and professional qualifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No credentials yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your professional licenses and certifications to track expiration dates.
                  </p>
                  <Button onClick={openAddDialog} className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Credential
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials.map((credential) => (
                      <TableRow key={credential.id}>
                        <TableCell className="font-medium">
                          {credential.name}
                          {credential.notes && (
                            <p className="text-xs text-gray-500 mt-1">{credential.notes}</p>
                          )}
                        </TableCell>
                        <TableCell>{credential.issuer || 'N/A'}</TableCell>
                        <TableCell>{credential.licenseNo || 'N/A'}</TableCell>
                        <TableCell>{formatDate(credential.issuedAt)}</TableCell>
                        <TableCell>{formatDate(credential.expiresAt)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex items-center gap-1 w-fit ${getStatusColor(credential.status)}`}
                          >
                            {getStatusIcon(credential.status)}
                            {credential.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(credential)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(credential.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Management</CardTitle>
                <CardDescription>
                  Upload or create your professional resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="/me/resume">
                    Manage Resume
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Card</CardTitle>
                <CardDescription>
                  Create and customize your digital business card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="/me/card">
                    Edit Business Card
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}