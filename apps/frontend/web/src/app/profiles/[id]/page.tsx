import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Linkedin, Twitter, Globe } from 'lucide-react';
import Image from 'next/image';

interface Profile {
  id: string;
  orgId: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  avatarUrl: string;
  socials: {
    linkedin?: string;
    x?: string;
  };
}

async function getProfile(id: string): Promise<Profile | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/profiles/${id}`, { cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await getProfile(params.id);
  
  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              {profile.avatarUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{profile.title}</p>
            
            {/* Social Links */}
            {(profile.socials.linkedin || profile.socials.x) && (
              <div className="flex justify-center gap-3">
                {profile.socials.linkedin && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.socials.x && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={profile.socials.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Twitter className="mr-2 h-4 w-4" />
                      X
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Organization:</span>
                    <span className="text-sm text-gray-600">{profile.orgId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile ID:</span>
                    <span className="text-sm text-gray-600">{profile.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.socials.linkedin && (
                    <Button asChild className="w-full">
                      <a
                        href={profile.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="mr-2 h-4 w-4" />
                        Connect on LinkedIn
                      </a>
                    </Button>
                  )}
                  {profile.socials.x && (
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={profile.socials.x}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="mr-2 h-4 w-4" />
                        Follow on X
                      </a>
                    </Button>
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