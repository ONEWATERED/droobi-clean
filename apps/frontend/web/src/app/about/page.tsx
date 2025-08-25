import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink } from 'lucide-react';
import { getEffectiveSettings } from '@/lib/settings';
import { sanitizeHtml } from '@/lib/sanitize';

export default async function AboutPage() {
  const settings = await getEffectiveSettings();
  const sanitizedAboutHtml = sanitizeHtml(settings.aboutHtml);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About {settings.brandName}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {settings.brandTagline}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizedAboutHtml }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="mr-3 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Support</p>
                        <a
                          href={`mailto:${settings.supportEmail}`}
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {settings.supportEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settings.privacyUrl && (
                      <a
                        href={settings.privacyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Privacy Policy
                      </a>
                    )}
                    {settings.termsUrl && (
                      <a
                        href={settings.termsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Terms of Service
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              {(settings.social.x || settings.social.linkedin || settings.social.youtube) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {settings.social.x && (
                        <a
                          href={settings.social.x}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          X (Twitter)
                        </a>
                      )}
                      {settings.social.linkedin && (
                        <a
                          href={settings.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {settings.social.youtube && (
                        <a
                          href={settings.social.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          YouTube
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}