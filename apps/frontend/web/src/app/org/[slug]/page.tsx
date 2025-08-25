import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Globe, Mail, MapPin, Tag } from 'lucide-react';

interface Organization {
  slug: string;
  name: string;
  type: string;
  category: string;
  region: string;
  about: string;
  website?: string;
  email?: string;
}

async function getOrg(slug: string): Promise<Organization | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/org/${slug}`, { cache: 'no-store' });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return null;
  }
}

export default async function OrgPage({ params }: { params: { slug: string } }) {
  const org = await getOrg(params.slug);
  
  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">{org.name}</h1>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            <Badge variant="default" className="text-sm">
              {org.type}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {org.category}
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{org.about}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm">{org.region}</span>
                  </div>
                  
                  {org.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-500 mr-3" />
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  {org.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-3" />
                      <a
                        href={`mailto:${org.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {org.email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organization Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {org.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Category:</span>
                    <Badge variant="secondary" className="text-xs">
                      {org.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Region:</span>
                    <span className="text-sm text-gray-600">{org.region}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {org.website && (
                    <Button asChild className="w-full">
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                  {org.email && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={`mailto:${org.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
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